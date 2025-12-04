import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.js';
import { dataRoutes } from './routes/data.js';

const fastify = Fastify({
  logger: true,
});

// Environment variables
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET;
const JELLYFIN_SERVER_URL = process.env.JELLYFIN_SERVER_URL;
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS allowed origins based on environment
const PRODUCTION_ORIGIN = 'https://warped.raja-house.com';
const DEVELOPMENT_ORIGINS = [PRODUCTION_ORIGIN, 'http://localhost:5173'];

if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required');
  console.error('Generate one with: openssl rand -base64 32');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('JWT_SECRET should be at least 32 characters long for security');
  process.exit(1);
}

if (!JELLYFIN_SERVER_URL) {
  console.error('JELLYFIN_SERVER_URL environment variable is required');
  process.exit(1);
}

if (!JELLYFIN_API_KEY) {
  console.error('JELLYFIN_API_KEY environment variable is required');
  process.exit(1);
}

// Get CORS origins based on NODE_ENV
function getCorsOrigins(): string[] {
  if (NODE_ENV === 'production') {
    console.log(`CORS: Production mode - allowing only ${PRODUCTION_ORIGIN}`);
    return [PRODUCTION_ORIGIN];
  } else {
    console.log(`CORS: Development mode - allowing ${DEVELOPMENT_ORIGINS.join(', ')}`);
    return DEVELOPMENT_ORIGINS;
  }
}

// Register plugins
await fastify.register(cors, {
  origin: getCorsOrigins(),
  credentials: true,
});

await fastify.register(jwt, {
  secret: JWT_SECRET,
});

// Decorate fastify with config
fastify.decorate('config', {
  jellyfinServerUrl: JELLYFIN_SERVER_URL,
  jellyfinApiKey: JELLYFIN_API_KEY,
});

// Register routes
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(dataRoutes, { prefix: '/api' });

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`Server listening on ${HOST}:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
