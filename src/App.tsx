import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/api';

interface NowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  duration?: number;
  progress?: number;
}

interface Track {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  playedAt?: string;
  popularity?: number;
}

function App() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [activeTab, setActiveTab] = useState<'now' | 'recent' | 'top'>('now');

  useEffect(() => {
    fetchNowPlaying();
    fetchRecentTracks();
    fetchTopTracks();

    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(`${API_URL}/now-playing`);
      const data = await response.json();
      setNowPlaying(data);
    } catch (error) {
      console.error('Error fetching now playing:', error);
    }
  };

  const fetchRecentTracks = async () => {
    try {
      const response = await fetch(`${API_URL}/recently-played?limit=10`);
      const data = await response.json();
      setRecentTracks(data.tracks);
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
    }
  };

  const fetchTopTracks = async () => {
    try {
      const response = await fetch(`${API_URL}/top-tracks?limit=10&time_range=medium_term`);
      const data = await response.json();
      setTopTracks(data.tracks);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🎵 My Spotify Music</h1>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'now' ? 'active' : ''} 
          onClick={() => setActiveTab('now')}
        >
          Now Playing
        </button>
        <button 
          className={activeTab === 'recent' ? 'active' : ''} 
          onClick={() => setActiveTab('recent')}
        >
          Recently Played
        </button>
        <button 
          className={activeTab === 'top' ? 'active' : ''} 
          onClick={() => setActiveTab('top')}
        >
          Top Tracks
        </button>
      </div>

      <main>
        {activeTab === 'now' && (
          <div className="now-playing">
            {nowPlaying?.isPlaying ? (
              <div className="track-card featured">
                <img src={nowPlaying.albumImageUrl} alt={nowPlaying.album} />
                <div className="track-info">
                  <h2>{nowPlaying.title}</h2>
                  <p className="artist">{nowPlaying.artist}</p>
                  <p className="album">{nowPlaying.album}</p>
                  <a href={nowPlaying.songUrl} target="_blank" rel="noopener noreferrer">
                    Listen on Spotify
                  </a>
                </div>
              </div>
            ) : (
              <div className="not-playing">
                <p>Not currently playing anything</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="track-list">
            {recentTracks.map((track, index) => (
              <div key={index} className="track-card">
                <img src={track.albumImageUrl} alt={track.album} />
                <div className="track-info">
                  <h3>{track.title}</h3>
                  <p className="artist">{track.artist}</p>
                  <p className="album">{track.album}</p>
                  <a href={track.songUrl} target="_blank" rel="noopener noreferrer">
                    Listen
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'top' && (
          <div className="track-list">
            {topTracks.map((track, index) => (
              <div key={index} className="track-card">
                <span className="rank">#{index + 1}</span>
                <img src={track.albumImageUrl} alt={track.album} />
                <div className="track-info">
                  <h3>{track.title}</h3>
                  <p className="artist">{track.artist}</p>
                  <p className="album">{track.album}</p>
                  <a href={track.songUrl} target="_blank" rel="noopener noreferrer">
                    Listen
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
