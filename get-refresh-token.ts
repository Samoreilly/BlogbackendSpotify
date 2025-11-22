import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/callback';

// Step 1: Visit this URL to authorize
app.get('/login', (req, res) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state',
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: CLIENT_ID!,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: scopes,
  })}`;

  res.send(`
    <h1>Spotify Refresh Token Generator</h1>
    <p>Click the link below to authorize with Spotify:</p>
    <a href="${authUrl}" style="font-size: 18px; padding: 10px 20px; background: #1db954; color: white; text-decoration: none; border-radius: 500px; display: inline-block;">
      Authorize with Spotify
    </a>
  `);
});

// Step 2: Handle the callback and exchange code for refresh token
app.get('/callback', async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.send('<h1>Error: No code provided</h1>');
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    res.send(`
      <h1>Success! 🎉</h1>
      <p>Copy your refresh token and add it to your .env file:</p>
      <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <strong>SPOTIFY_REFRESH_TOKEN=</strong>${refresh_token}
      </div>
      <p style="color: #666; font-size: 14px;">Access Token (for testing): ${access_token}</p>
      <p>You can now close this window and stop the server (Ctrl+C)</p>
    `);

    console.log('\n✅ SUCCESS! Add this to your .env file:');
    console.log(`SPOTIFY_REFRESH_TOKEN=${refresh_token}\n`);
  } catch (error: any) {
    console.error('Error getting refresh token:', error.response?.data || error.message);
    res.send(`<h1>Error</h1><pre>${JSON.stringify(error.response?.data || error.message, null, 2)}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log(`\n🎵 Spotify Auth Helper running on http://localhost:${PORT}`);
  console.log(`\n📝 Steps to get your refresh token:`);
  console.log(`   1. Make sure you've added ${REDIRECT_URI} to your Spotify app's Redirect URIs`);
  console.log(`   2. Visit: http://localhost:${PORT}/login`);
  console.log(`   3. Authorize with Spotify`);
  console.log(`   4. Copy the refresh token to your .env file\n`);
});
