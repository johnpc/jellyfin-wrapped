# Jellyfin Wrapped

A web application that generates personalized year-in-review statistics for your Jellyfin media server, inspired by Spotify Wrapped.

## ⚠️ Security Warning

**DO NOT host this application publicly on the internet when using API keys as environment variables.** The API key is embedded in the frontend JavaScript bundle and will be visible to anyone who visits your site. This could expose your Jellyfin server to unauthorized access.

**Recommended deployment options:**
- Host locally on your home network only
- Use behind a VPN or authentication proxy
- Deploy on a private network/intranet
- Consider implementing server-side API key handling for public deployments

## Features

- 📊 View your most watched movies and TV shows
- 🎵 See your most played music
- ⏱️ Track your total watching/listening time
- 📈 Get insights into your viewing habits
- 🔒 Secure connection to your Jellyfin server
- 📱 Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- A Jellyfin server (version 10.8.0 or higher) with Jellyfin's official [Playback Reporting plugin](https://github.com/jellyfin/jellyfin-plugin-playbackreporting) installed
- Admin access to your Jellyfin server to generate an API key
- Your Jellyfin server URL
- A valid Jellyfin username and password for user authentication

### Environment Variables

The application requires the following environment variables to be set:

**For Development (Vite):**
- `VITE_JELLYFIN_SERVER_URL`: The URL of your Jellyfin server (e.g., `http://192.168.1.100:8096`)
- `VITE_JELLYFIN_API_KEY`: An admin API key for accessing playback reporting data

**For Production (Docker/Runtime):**
- `JELLYFIN_SERVER_URL`: The URL of your Jellyfin server (e.g., `http://192.168.1.100:8096`)
- `JELLYFIN_API_KEY`: An admin API key for accessing playback reporting data

You can set these in a `.env` file in the project root for development:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your values
VITE_JELLYFIN_SERVER_URL=http://your-jellyfin-server:8096
VITE_JELLYFIN_API_KEY=your-admin-api-key-here
```

#### Getting an Admin API Key

1. Log into your Jellyfin server as an administrator
2. Go to Dashboard → API Keys
3. Click "+" to create a new API key
4. Give it a name (e.g., "Jellyfin Wrapped")
5. Copy the generated API key and use it as `VITE_JELLYFIN_API_KEY` (development) or `JELLYFIN_API_KEY` (production)

**Note**: The admin API key is required because recent Jellyfin versions restrict the `user_usage_stats/submit_custom_query` endpoint to admin users only.

### Usage

1. Set up the required environment variables (see Environment Variables section above)
2. Run the application locally or deploy it to your preferred hosting platform
3. If server URL is not configured via environment variables, enter your Jellyfin server URL
4. Log in with your Jellyfin credentials
5. View your personalized media statistics!

## Development

This project is built with:

- React 18
- TypeScript
- Vite
- Radix UI
- TailwindCSS
- React Router

### Local Development

```bash
# Clone the repository
git clone https://github.com/johnpc/jellyfin-wrapped.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## Building for Production

### Create production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Building with Docker

To build with docker, run the following commands

```bash
npm run build
docker build -t jellyfin-wrapped .
docker run -p 80:80 \
  -e JELLYFIN_SERVER_URL=http://your-jellyfin-server:8096 \
  -e JELLYFIN_API_KEY=your-admin-api-key \
  jellyfin-wrapped
```

Or, via docker compose:

```bash
# Edit docker-compose.yaml to set your environment variables
# Start the service
docker compose up -d

# Stop the service
docker compose down

# Pull latest version
docker compose pull
```

Now the Jellyfin Wrapped ui is available at `http://localhost` on port 80.

### Updating Published Docker Image

```bash
docker build -t jellyfin-wrapped . --no-cache
docker tag jellyfin-wrapped:latest mrorbitman/jellyfin-wrapped:latest
docker push mrorbitman/jellyfin-wrapped:latest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Privacy

This application connects directly to your Jellyfin server and does not store any credentials or personal data on external servers. All data is processed locally in your browser.

## Demo Screenshots

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.12.44%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.13.40%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.14.16%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.15.57%E2%80%AFAM.png)

![](https://files.jpc.io/d/rNQyo-Screenshot%202025-01-02%20at%2012.16.33%E2%80%AFAM.png)
