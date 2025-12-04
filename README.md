# Jellyfin Wrapped

A web application that generates personalized year-in-review statistics for your Jellyfin media server, inspired by Spotify Wrapped.

## Features

- 📊 View your most watched movies and TV shows
- 🎵 See your most played music
- ⏱️ Track your total watching/listening time
- 📈 Get insights into your viewing habits
- 🔒 **Secure backend API** - Admin API key never exposed to browsers
- 📱 Responsive design for mobile and desktop

## Architecture

```
┌─────────────┐      HTTPS       ┌─────────────┐    API Key    ┌─────────────┐
│   Browser   │ ───────────────► │   Backend   │ ────────────► │  Jellyfin   │
│  (React UI) │ ◄─────────────── │   (Node.js) │ ◄──────────── │   Server    │
└─────────────┘    JWT + JSON    └─────────────┘               └─────────────┘
```

The backend provides a proper REST API:
- **API key stays server-side only** - never sent to browser
- **JWT authentication** - secure session management
- **Dedicated endpoints** - `/api/movies`, `/api/shows`, `/api/actors`, etc.
- **All queries run server-side** - no raw SQL from the frontend

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /auth/login` | Authenticate with Jellyfin credentials |
| `POST /auth/logout` | Invalidate session |
| `GET /auth/verify` | Verify session is valid |
| `GET /api/user` | Get current user info |
| `GET /api/movies` | List movies with playback stats |
| `GET /api/shows` | List shows with episode stats |
| `GET /api/audio` | List audio tracks |
| `GET /api/music-videos` | List music videos |
| `GET /api/live-tv` | List live TV channels |
| `GET /api/actors` | List favorite actors |
| `GET /api/device-stats` | Get device/browser/OS stats |
| `GET /api/punch-card` | Get activity by day/hour |
| `GET /api/calendar` | Get activity calendar data |
| `GET /api/monthly-shows` | Get top show per month |
| `GET /api/unfinished-shows` | Get partially watched shows |
| `GET /api/watched-on-date?date=YYYY-MM-DD` | Get items watched on date |

All endpoints (except auth) support `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` query parameters.

## Getting Started

### Prerequisites

- A Jellyfin server (version 10.8.0 or higher) with Jellyfin's official [Playback Reporting plugin](https://github.com/jellyfin/jellyfin-plugin-playbackreporting) installed
- Admin access to your Jellyfin server to generate an API key
- Docker and Docker Compose (for production deployment)

### Quick Start with Docker Compose

1. Copy the [`docker-compose.yaml`](docker-compose.yaml) file from this repository

2. Edit the environment variables:
   - `JELLYFIN_SERVER_URL` - Your Jellyfin server address (e.g., `http://192.168.1.100:8096`)
   - `JELLYFIN_API_KEY` - See "Getting an Admin API Key" below
   - `JWT_SECRET` - A random string for JWT signing (generate with `openssl rand -base64 32`)
   - `BACKEND_URL` - URL that browsers will use to reach the backend:
     - `http://localhost:3001` - For local testing
     - `http://your-server-ip:3001` - For LAN access
     - `https://api.yourdomain.com` - For public access with HTTPS

3. Start the services:

```bash
docker compose up -d
```

4. Access the app at `http://localhost`

### Getting an Admin API Key

1. Log into your Jellyfin server as an administrator
2. Go to Dashboard → API Keys
3. Click "+" to create a new API key
4. Give it a name (e.g., "Jellyfin Wrapped")
5. Copy the generated API key

**Note**: The admin API key is required because recent Jellyfin versions restrict the `user_usage_stats/submit_custom_query` endpoint to admin users only.

### HTTPS for Production

For public deployments, put a reverse proxy (like Traefik, Caddy, or nginx) in front of the services to handle TLS/HTTPS. Make sure to update `BACKEND_URL` to use `https://` when using HTTPS.

## Development

### Prerequisites

- Node.js 20+
- npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/sraja7272/jellyfin-wrapped.git
cd jellyfin-wrapped

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Copy and configure environment files
cp .env.example .env
cp backend/.env.example backend/.env
# Edit backend/.env with your Jellyfin server URL and API key

# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal)
npm run dev
```

### Environment Variables

**Backend:**
| Variable | Required | Description |
|----------|----------|-------------|
| `JELLYFIN_SERVER_URL` | Yes | Your Jellyfin server URL |
| `JELLYFIN_API_KEY` | Yes | Admin API key |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (min 32 characters) |
| `NODE_ENV` | Recommended | Set to `production` for production deployments. Controls CORS: <br>• **Production**: allows `https://warped.raja-house.com` <br>• **Development**: allows `https://warped.raja-house.com` + `http://localhost:5173` |
| `PORT` | No | Server port (default: 3001) |
| `HOST` | No | Server host (default: 0.0.0.0) |

**Frontend (Docker/Production):**
| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes | URL where backend is accessible from browser |
| `JELLYFIN_SERVER_URL` | Yes | Your Jellyfin server URL (for images) |

**Frontend (Vite Development):**
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes | URL of backend (e.g., `http://localhost:3001`) |

## Building for Production

### Build Frontend

```bash
npm run build
```

### Build Docker Images

```bash
# Build frontend
npm run build
docker build -t jellyfin-wrapped .

# Build backend
cd backend
docker build -t jellyfin-wrapped-backend .
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Radix UI, TailwindCSS, Framer Motion
- **Backend**: Node.js, Fastify, TypeScript
- **Authentication**: JWT with in-memory session storage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Privacy & Security

- Admin API keys are stored **only on the backend server** - never exposed to browsers
- All data queries run **server-side** - the frontend only receives processed JSON
- User credentials are validated with Jellyfin and exchanged for JWT tokens
- All communication should be over HTTPS in production
- Sessions are stored in memory and cleared on backend restart
- **Input validation** - All date parameters are validated to prevent SQL injection
- **CORS protection** - Only allowed origins can access the API (based on `NODE_ENV`)
- **Strong JWT requirement** - JWT secret must be at least 32 characters

## Demo Screenshots

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.12.44%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.13.40%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.14.16%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.15.57%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.16.33%E2%80%AFAM.png)
