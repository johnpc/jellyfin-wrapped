# Jellyfin Wrapped

A web application that generates personalized year-in-review statistics for your Jellyfin media server, inspired by Spotify Wrapped.

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
- Your Jellyfin server URL
- A valid Jellyfin username and password

### Usage

1. Visit [Jellyfin Wrapped](https://jellyfin-wrapped.jpc.io)
2. Enter your Jellyfin server URL
3. Log in with your Jellyfin credentials
4. View your personalized media statistics!

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
docker run -p 80:80 jellyfin-wrapped
```

Or, via docker compose:

```bash
# Start the service
docker compose up -d

# Stop the service
docker compose down

# Pull latest version
docker compose pull
```

Now the Jellyfin Wrapped ui is available at `http://localhost` on port 80.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Privacy

This application connects directly to your Jellyfin server and does not store any credentials or personal data on external servers. All data is processed locally in your browser.

