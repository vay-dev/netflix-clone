import "./App.scss";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import { videoService } from './services/videoService';
import type { Video } from './interfaces/video.interface';

// Components
import Navbar from './components/Navbar';
import Search from "./components/search";
import MovieCarousel from "./components/movieCarousel";
import VideoCard from './components/VideoCard';
import ErrorMessage from "./components/errorMesage";
import Login from './components/Login';
import Register from './components/Register';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import Downloads from './components/Downloads';
import Dashboard from './components/Dashboard/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Home Component
const HomePage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await videoService.getVideos();
      setVideos(data);
      setFilteredVideos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchTerm, videos]);

  const handleRetry = () => fetchVideos();

  if (error) {
    return (
      <div className="app">
        <ErrorMessage error={error} onRetry={handleRetry} maxAttempts={3} retryDelay={5} />
      </div>
    );
  }

  const moviesForCarousel = filteredVideos.slice(0, 10).map(v => ({
    id: v.id,
    title: v.title,
    poster_path: v.thumbnail,
    backdrop_path: v.thumbnail,
    overview: v.description,
    vote_average: v.average_rating,
    release_date: v.release_date,
    genre_ids: v.genres.map(g => g.id),
    adult: false,
    original_language: 'en',
    original_title: v.title,
    popularity: v.likes_count,
    video: true,
    vote_count: v.likes_count
  }));

  const backgroundMovie = moviesForCarousel.length > 0 ? moviesForCarousel[0] : null;

  return (
    <div className="app">
      <div className="search-and-header">
        <header className="header">
          <h1 className="header__greeting text-capitalize">
            Welcome To <br /> <span className="title text-capitalize">FilmFlare</span>
          </h1>
          <h1 className="header__description text-capitalize">
            Find <span className="title">videos</span> you'll enjoy
          </h1>
          <h1 className="header__secondary__description text-capitalize">
            without the hassle
          </h1>
        </header>

        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          fetchMoviesByGenre={() => {}}
          selectedGenre={null}
          setSelectedGenre={() => {}}
          activeTab="all"
          setActiveTab={() => {}}
        />
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-carousel">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="content-section">
            {moviesForCarousel.length > 0 && (
              <MovieCarousel
                title="Featured Videos"
                movies={moviesForCarousel}
                showDetails={false}
                backgroundMovie={backgroundMovie}
              />
            )}

            <div style={{ marginTop: '3rem' }}>
              <h2 className="section-title">
                {searchTerm ? `Search Results for "${searchTerm}"` : 'All Videos'}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem',
                padding: '0 1rem'
              }}>
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    showDetails={true}
                    onUpdate={fetchVideos}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <VideoPlayer
            videoUrl={selectedVideo.video_file}
            poster={selectedVideo.thumbnail}
            onClose={() => setSelectedVideo(null)}
          />
        </div>
      )}
    </div>
  );
};

// Favorites Page
const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await videoService.getFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="app" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'white' }}>
          My Favorites
        </h1>
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : error ? (
          <p style={{ color: '#ff4444' }}>{error}</p>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#a0a0a0' }}>
            <p>No favorites yet. Start adding videos!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {favorites.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                showDetails={true}
                onUpdate={fetchFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute adminOnly={true}>
            <VideoUpload />
          </ProtectedRoute>
        } />
        <Route path="/downloads" element={
          <ProtectedRoute>
            <div style={{ paddingTop: '100px', maxWidth: '1400px', margin: '0 auto', padding: '100px 2rem 2rem' }}>
              <Downloads />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
