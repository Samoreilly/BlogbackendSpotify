# Spotify Music Blog Server

A personal blog page server for displaying your Spotify music with a React frontend and Express API backend.

## Features

- 🎵 Now Playing - See what you're currently listening to
- 📝 Recently Played - View your recent listening history
- ⭐ Top Tracks - Display your most played tracks
- 🎨 Beautiful Spotify-themed UI

## Setup

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your Client ID and Client Secret
4. Add `http://localhost:3001/callback` to Redirect URIs

### 2. Get Refresh Token

You'll need to get a refresh token. You can use this URL (replace CLIENT_ID):

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3001/callback&scope=user-read-currently-playing%20user-read-recently-played%20user-top-read
```

Then exchange the code for a refresh token using curl or Postman.

### 3. Configure Environment

Update the `.env` file with your credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token
PORT=3001
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

Terminal 1 - Start the API server:
```bash
npm run server
```

Terminal 2 - Start the React dev server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see your Spotify music blog!

## API Endpoints

- `GET /api/now-playing` - Get currently playing track
- `GET /api/recently-played?limit=10` - Get recently played tracks
- `GET /api/top-tracks?limit=10&time_range=medium_term` - Get top tracks
- `GET /api/top-artists?limit=10&time_range=medium_term` - Get top artists

## Build for Production

```bash
npm run build
npm run preview
```
