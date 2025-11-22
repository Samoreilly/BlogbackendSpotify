import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

let accessToken = '';
let tokenExpiry = 0;

// Get Spotify access token
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// API Routes

// Get currently playing track
app.get('/api/now-playing', async (_req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 204 || !response.data) {
      return res.json({ isPlaying: false });
    }

    const { item, is_playing } = response.data;

    res.json({
      isPlaying: is_playing,
      title: item.name,
      artist: item.artists.map((artist: any) => artist.name).join(', '),
      album: item.album.name,
      albumImageUrl: item.album.images[0]?.url,
      songUrl: item.external_urls.spotify,
      duration: item.duration_ms,
      progress: response.data.progress_ms,
    });
  } catch (error: any) {
    console.error('Error fetching now playing:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch currently playing track' });
  }
});

// Get recently played tracks
app.get('/api/recently-played', async (req, res) => {
  try {
    const token = await getAccessToken();
    const limit = req.query.limit || 10;
    
    const response = await axios.get(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const tracks = response.data.items.map((item: any) => ({
      title: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(', '),
      album: item.track.album.name,
      albumImageUrl: item.track.album.images[0]?.url,
      songUrl: item.track.external_urls.spotify,
      playedAt: item.played_at,
    }));

    res.json({ tracks });
  } catch (error: any) {
    console.error('Error fetching recently played:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
});

// Get top tracks
app.get('/api/top-tracks', async (req, res) => {
  try {
    const token = await getAccessToken();
    const limit = req.query.limit || 10;
    const timeRange = req.query.time_range || 'medium_term'; // short_term, medium_term, long_term
    
    const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const tracks = response.data.items.map((track: any) => ({
      title: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      album: track.album.name,
      albumImageUrl: track.album.images[0]?.url,
      songUrl: track.external_urls.spotify,
      popularity: track.popularity,
    }));

    res.json({ tracks });
  } catch (error: any) {
    console.error('Error fetching top tracks:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get top artists
app.get('/api/top-artists', async (req, res) => {
  try {
    const token = await getAccessToken();
    const limit = req.query.limit || 10;
    const timeRange = req.query.time_range || 'medium_term';
    
    const response = await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const artists = response.data.items.map((artist: any) => ({
      name: artist.name,
      genres: artist.genres,
      imageUrl: artist.images[0]?.url,
      artistUrl: artist.external_urls.spotify,
      popularity: artist.popularity,
      followers: artist.followers.total,
    }));

    res.json({ artists });
  } catch (error: any) {
    console.error('Error fetching top artists:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Spotify server running on http://localhost:${PORT}`);
});
