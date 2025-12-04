import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getSession } from '../session-store.js';
import type { JwtPayload, Timeframe } from '../types.js';
import '../types.js';
import { JellyfinConfig } from '../services/jellyfin.js';
import * as queries from '../services/queries.js';

interface TimeframeQuery {
  startDate?: string;
  endDate?: string;
}

interface DateQuery {
  date: string;
}

// Regex pattern for valid date format (YYYY-MM-DD)
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Validate and sanitize a date string to prevent SQL injection
// Returns null if the date is invalid
function validateDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  // Check format matches YYYY-MM-DD exactly
  if (!DATE_PATTERN.test(dateStr)) {
    return null;
  }
  
  // Parse and validate it's a real date
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  
  // Return the sanitized date string (reconstructed from parsed date to ensure validity)
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Get Jellyfin config from request
function getConfig(request: FastifyRequest, fastify: FastifyInstance): JellyfinConfig {
  const session = (request as any).session;
  return {
    serverUrl: fastify.config.jellyfinServerUrl,
    apiKey: fastify.config.jellyfinApiKey,
    userToken: session.jellyfinToken,
    userId: session.jellyfinUserId,
  };
}

// Get timeframe from query params or use defaults
// Throws an error if dates are provided but invalid (potential SQL injection attempt)
function getTimeframe(query: TimeframeQuery): Timeframe {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Default to current year
  const defaultStart = `${currentYear}-01-01`;
  const defaultEnd = `${currentYear}-12-31`;

  // Validate provided dates
  let startDate = defaultStart;
  let endDate = defaultEnd;

  if (query.startDate) {
    const validated = validateDate(query.startDate);
    if (!validated) {
      throw new Error('Invalid startDate format. Expected YYYY-MM-DD');
    }
    startDate = validated;
  }

  if (query.endDate) {
    const validated = validateDate(query.endDate);
    if (!validated) {
      throw new Error('Invalid endDate format. Expected YYYY-MM-DD');
    }
    endDate = validated;
  }

  return { startDate, endDate };
}

// Middleware to verify JWT and session
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as JwtPayload;

    const session = getSession(payload.jti);
    if (!session) {
      return reply.status(401).send({ error: 'Session expired' });
    }

    (request as any).session = session;
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function dataRoutes(fastify: FastifyInstance) {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);

  // Get current user info
  fastify.get('/user', async (request, reply) => {
    const session = (request as any).session;
    return {
      id: session.jellyfinUserId,
      name: session.username,
    };
  });

  // List movies with stats
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/movies',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const movies = await queries.listMovies(config, timeframe);
        return movies;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching movies');
        return reply.status(500).send({ error: 'Failed to fetch movies' });
      }
    }
  );

  // List shows with stats
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/shows',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const shows = await queries.listShows(config, timeframe);
        return shows;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching shows');
        return reply.status(500).send({ error: 'Failed to fetch shows' });
      }
    }
  );

  // List audio
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/audio',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const audio = await queries.listAudio(config, timeframe);
        return audio;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching audio');
        return reply.status(500).send({ error: 'Failed to fetch audio' });
      }
    }
  );

  // List music videos
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/music-videos',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const videos = await queries.listMusicVideos(config, timeframe);
        return videos;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching music videos');
        return reply.status(500).send({ error: 'Failed to fetch music videos' });
      }
    }
  );

  // List live TV channels
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/live-tv',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const channels = await queries.listLiveTvChannels(config, timeframe);
        return channels;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching live TV');
        return reply.status(500).send({ error: 'Failed to fetch live TV' });
      }
    }
  );

  // Get device stats
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/device-stats',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const stats = await queries.getDeviceStats(config, timeframe);
        return stats;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching device stats');
        return reply.status(500).send({ error: 'Failed to fetch device stats' });
      }
    }
  );

  // Get punch card data
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/punch-card',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const data = await queries.getPunchCardData(config, timeframe);
        return data;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching punch card');
        return reply.status(500).send({ error: 'Failed to fetch punch card' });
      }
    }
  );

  // Get calendar data
  fastify.get('/calendar', async (request, reply) => {
    try {
      const config = getConfig(request, fastify);
      const data = await queries.getCalendarData(config);
      return data;
    } catch (error) {
      fastify.log.error(error, 'Error fetching calendar');
      return reply.status(500).send({ error: 'Failed to fetch calendar' });
    }
  });

  // Get monthly show stats
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/monthly-shows',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const stats = await queries.getMonthlyShowStats(config, timeframe);
        return stats;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching monthly shows');
        return reply.status(500).send({ error: 'Failed to fetch monthly shows' });
      }
    }
  );

  // Get unfinished shows
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/unfinished-shows',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const shows = await queries.getUnfinishedShows(config, timeframe);
        return shows;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching unfinished shows');
        return reply.status(500).send({ error: 'Failed to fetch unfinished shows' });
      }
    }
  );

  // Get favorite actors
  fastify.get<{ Querystring: TimeframeQuery }>(
    '/actors',
    async (request, reply) => {
      try {
        const config = getConfig(request, fastify);
        const timeframe = getTimeframe(request.query);
        const actors = await queries.listFavoriteActors(config, timeframe);
        return actors;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.status(400).send({ error: error.message });
        }
        fastify.log.error(error, 'Error fetching actors');
        return reply.status(500).send({ error: 'Failed to fetch actors' });
      }
    }
  );

  // Get items watched on a specific date
  fastify.get<{ Querystring: DateQuery }>(
    '/watched-on-date',
    async (request, reply) => {
      const { date } = request.query;
      if (!date) {
        return reply.status(400).send({ error: 'date parameter is required' });
      }

      // Validate date format to prevent SQL injection
      const validatedDate = validateDate(date);
      if (!validatedDate) {
        return reply.status(400).send({ error: 'Invalid date format. Expected YYYY-MM-DD' });
      }

      try {
        const config = getConfig(request, fastify);
        const items = await queries.getWatchedOnDate(config, validatedDate);
        return items;
      } catch (error) {
        fastify.log.error(error, 'Error fetching watched on date');
        return reply.status(500).send({ error: 'Failed to fetch watched on date' });
      }
    }
  );
}

