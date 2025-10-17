import "./App.scss";
import { useState, useEffect } from "react";
import type {
  MovieInterface,
  MovieApiResponseInterface,
} from "./interfaces/movie.interface";
// ===== COMPONENT IMPORTS ===== //
import Search from "./components/search"; // Search component with tabs and genre buttons
import MovieCarousel from "./components/movieCarousel.tsx"; // Horizontal scrolling movie carousel
import MovieGrid from "./components/movieGrid"; // Responsive grid layout for movies
import type { BtnValueInterface } from "./interfaces/btnValue.interface";
import { updateSearchTerm, getTrendingMovies } from "./appwrite.ts";
import ErrorMessage from "./components/errorMesage.tsx"; // Error handling component

const App = () => {
  // ====== STATE DECLARATIONS ===== //
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [genreMovies, setGenreMovies] = useState<MovieInterface[]>([]); // Movies filtered by genre
  const [movies, setMovies] = useState<MovieInterface[]>([]); // Search results or default movies
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]); // Trending searches from Appwrite
  const [popularMovies, setPopularMovies] = useState<MovieInterface[]>([]); // Popular movies for carousel
  const [activeTab, setActiveTab] = useState<"all" | "genres" | "trending">(
    "all"
  ); // Current active tab
  const [currentCarouselMovie, setCurrentCarouselMovie] =
    useState<MovieInterface | null>(null); // Movie for carousel background
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<BtnValueInterface | null>(
    null
  ); // Currently selected genre
  const [currentGenreLabel, setCurrentGenreLabel] = useState<string>(""); // Label for current genre

  // ====== API CONSTANTS ===== //
  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_KEY = import.meta.env.VITE_TMDB_API_ACCESS_TOKEN;
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  // ====== API FUNCTIONS ===== //

  // Fetch movies based on search query or default popular movies
  const fetchMovies = async (query: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      const data: MovieApiResponseInterface = await response.json();
      setMovies(data.results);

      // Save search term to Appwrite for trending data
      if (query && data.results.length > 0) {
        const movieForAppwrite = {
          ...data.results[0],
          poster_url: data.results[0].poster_path
            ? `${TMDB_IMAGE_BASE_URL}${data.results[0].poster_path}`
            : "",
        };
        updateSearchTerm(query, movieForAppwrite);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular movies for the main carousel display
  const fetchPopularMovies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/popular?page=1`,
        API_OPTIONS
      );
      const data: MovieApiResponseInterface = await response.json();
      setPopularMovies(data.results.slice(0, 20));

      // Set random movie as carousel background image
      if (data.results.length > 0) {
        const randomMovie =
          data.results[
            Math.floor(Math.random() * Math.min(5, data.results.length))
          ];
        setCurrentCarouselMovie(randomMovie);
      }
    } catch (error: any) {
      console.error("Error fetching popular movies:", error);
    }
  };

  // Fetch movies filtered by specific genre
  const fetchMoviesByGenre = async (genreId: number, genreLabel: string) => {
    setError(null);
    setLoading(true);
    setCurrentGenreLabel(genreLabel);
    try {
      const endpoint = `${API_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch genres!");
      const data: MovieApiResponseInterface = await response.json();
      setGenreMovies(data.results);

      // Set random movie from genre as background
      if (data.results.length > 0) {
        const randomMovie =
          data.results[
            Math.floor(Math.random() * Math.min(5, data.results.length))
          ];
        setCurrentCarouselMovie(randomMovie);
      }
    } catch (error: any) {
      setError(error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending search data from Appwrite database
  const fetchTrendingMoviesData = async () => {
    try {
      const trendingData = await getTrendingMovies();
      setTrendingMovies(trendingData || []);
    } catch (error: any) {
      console.error("Error fetching trending movies:", error);
    }
  };

  // ====== EVENT HANDLERS ===== //

  // Handle retry functionality for error states
  const handleRetry = () => {
    if (debouncedSearchTerm) {
      fetchMovies(debouncedSearchTerm);
    } else if (activeTab === "genres" && selectedGenre) {
      fetchMoviesByGenre(selectedGenre.id, selectedGenre.label);
    } else {
      fetchMovies(); // Fetch popular movies if no search term
    }
  };

  // ====== USEEFFECT HOOKS ===== //

  // Load initial data on component mount
  useEffect(() => {
    fetchPopularMovies();
    fetchTrendingMoviesData();
  }, []);

  // Handle search term changes and fetch results
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchMovies(debouncedSearchTerm);
    } else if (activeTab === "all") {
      fetchMovies();
    }
  }, [debouncedSearchTerm]);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ====== RENDER LOGIC ===== //

  // Main content renderer based on current state and active tab
  const renderContent = () => {
    // Show error message if there's an error
    if (error) {
      return (
        <ErrorMessage
          error={error}
          onRetry={handleRetry}
          maxAttempts={3}
          retryDelay={5}
        />
      );
    }

    // Show search results when user is searching
    if (searchTerm && debouncedSearchTerm) {
      return (
        <MovieGrid
          title={`Search Results for "${searchTerm}"`}
          movies={movies}
          showDetails={true}
          isLoading={loading}
        />
      );
    }

    // Render content based on active tab
    switch (activeTab) {
      case "all":
        return (
          <div className="content-section">
            {/* POPULAR MOVIES CAROUSEL - Shows horizontal scrolling popular movies */}
            {popularMovies.length > 0 && (
              <MovieCarousel
                title="Popular Movies"
                movies={popularMovies}
                showDetails={false}
                backgroundMovie={currentCarouselMovie}
              />
            )}

            {/* ALL MOVIES GRID - Shows all movies in grid layout */}
            {movies.length > 0 && (
              <MovieGrid
                title="All Movies"
                movies={movies}
                showDetails={true}
                isLoading={loading}
              />
            )}
          </div>
        );

      case "genres":
        return (
          <div className="content-section">
            {/* GENRE MOVIES CAROUSEL - Shows movies from selected genre */}
            {genreMovies.length > 0 && (
              <MovieCarousel
                title={`${currentGenreLabel} Movies`}
                movies={genreMovies}
                showDetails={false}
                isLarge={true} // Larger carousel for genre view
                backgroundMovie={currentCarouselMovie}
              />
            )}

            {/* GENRE MOVIES GRID - Shows all movies from selected genre */}
            {genreMovies.length > 0 && (
              <MovieGrid
                title={`All ${currentGenreLabel} Movies`}
                movies={genreMovies}
                showDetails={true}
                isLoading={loading}
              />
            )}
          </div>
        );

      case "trending":
        return (
          <div className="content-section">
            {/* TRENDING SEARCHES DISPLAY - Shows most searched movies from Appwrite */}
            {trendingMovies.length > 0 && (
              <div className="trending-section">
                <h2 className="section-title">Trending Searches</h2>
                <div className="trending-grid">
                  {trendingMovies.map((trend, index) => (
                    <div key={index} className="trending-item">
                      <img
                        src={trend.poster_url || "/default-poster.png"}
                        alt={trend.searchTerm}
                        className="trending-poster"
                      />
                      <div className="trending-info">
                        <h3>{trend.searchTerm}</h3>
                        <p>{trend.count} searches</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ====== MAIN COMPONENT RENDER ===== //
  return (
    <div className="app">
      {/* APP HEADER - Welcome message and branding */}
      <header className="header">
        <h1 className="header__greeting text-capitalize">
          Welcome To <br />{" "}
          <span className="title text-capitalize">FilmFlare</span>
        </h1>
        <h1 className="header__description text-capitalize">
          Find <span className="title">movies</span> you'll enjoy
        </h1>
        <h1 className="header__secondary__description text-capitalize">
          without the hassle
        </h1>
      </header>

      {/* SEARCH COMPONENT - Search bar, tabs (All/Trending/Genres), and genre buttons */}
      <Search
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        fetchMoviesByGenre={fetchMoviesByGenre}
        setSelectedGenre={setSelectedGenre}
        selectedGenre={selectedGenre}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* MAIN CONTENT AREA - Renders different content based on active tab and state */}
      <div className="page-content">{renderContent()}</div>
    </div>
  );
};

export default App;
