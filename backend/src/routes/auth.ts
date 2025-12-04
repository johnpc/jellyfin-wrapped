import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { createSession, deleteSession, getSession } from '../session-store.js';
import type { JwtPayload } from '../types.js';
import '../types.js'; // Import for side effects (module augmentation)

interface LoginBody {
  username: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // Login endpoint - validates credentials with Jellyfin and returns JWT
  fastify.post<{ Body: LoginBody }>(
    '/login',
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { username, password } = request.body;

      if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password are required' });
      }

      try {
        // Authenticate with Jellyfin
        const authResponse = await fetch(
          `${fastify.config.jellyfinServerUrl}/Users/AuthenticateByName`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Emby-Authorization': `MediaBrowser Client="Jellyfin-Wrapped-Backend", Device="Server", DeviceId="jellyfin-wrapped-backend", Version="1.0.0"`,
            },
            body: JSON.stringify({
              Username: username,
              Pw: password,
            }),
          }
        );

        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          fastify.log.warn(`Jellyfin auth failed for user ${username}: ${authResponse.status} ${errorText}`);
          return reply.status(401).send({ error: 'Invalid credentials' });
        }

        const authData = await authResponse.json() as {
          User: { Id: string; Name: string };
          AccessToken: string;
        };

        // Generate unique token ID for session tracking
        const jti = randomUUID();

        // Store session in memory
        createSession(jti, {
          jellyfinUserId: authData.User.Id,
          jellyfinToken: authData.AccessToken,
          username: authData.User.Name,
        });

        // Create JWT
        const token = fastify.jwt.sign(
          {
            jti,
            userId: authData.User.Id,
            username: authData.User.Name,
          } as JwtPayload,
          { expiresIn: '24h' }
        );

        return {
          token,
          user: {
            id: authData.User.Id,
            name: authData.User.Name,
          },
        };
      } catch (error) {
        fastify.log.error(error, 'Error during authentication');
        return reply.status(500).send({ error: 'Authentication failed' });
      }
    }
  );

  // Logout endpoint - invalidates JWT session
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as JwtPayload;

      if (payload.jti) {
        deleteSession(payload.jti);
      }

      return { success: true };
    } catch {
      // Even if token is invalid, return success (user is effectively logged out)
      return { success: true };
    }
  });

  // Verify endpoint - checks if current token is valid
  fastify.get('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as JwtPayload;

      // Check if session still exists in memory
      const session = getSession(payload.jti);
      if (!session) {
        return reply.status(401).send({ error: 'Session expired' });
      }

      return {
        valid: true,
        user: {
          id: payload.userId,
          name: payload.username,
        },
      };
    } catch {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });
}

