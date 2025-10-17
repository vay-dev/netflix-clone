import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./movieCard";
import type { MovieInterface } from "../interfaces/movie.interface";
import "./styles/movieCarousel.scss";

interface MovieCarouselProps {
  title: string;
  movies: MovieInterface[];
  showDetails?: boolean;
  isLarge?: boolean;
  backgroundMovie?: MovieInterface | null;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  movies,
  showDetails = false,
  isLarge = false,
  backgroundMovie,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerView = isLarge ? 4 : 6;
  const itemWidth = isLarge ? 320 : 220; // includes gap

  useEffect(() => {
    updateScrollButtons();
  }, [movies, currentIndex]);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 1);
  };

  const scrollLeft = () => {
    if (!scrollContainerRef.current || currentIndex === 0) return;

    const newIndex = Math.max(0, currentIndex - itemsPerView);
    setCurrentIndex(newIndex);

    scrollContainerRef.current.scrollTo({
      left: newIndex * itemWidth,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;

    const maxIndex = Math.max(0, movies.length - itemsPerView);
    const newIndex = Math.min(maxIndex, currentIndex + itemsPerView);
    setCurrentIndex(newIndex);

    scrollContainerRef.current.scrollTo({
      left: newIndex * itemWidth,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    updateScrollButtons();
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="movie-carousel">
      {backgroundMovie && (
        <div
          className="carousel-background"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w1280${
              backgroundMovie.backdrop_path || backgroundMovie.poster_path
            })`,
          }}
        />
      )}

      <div className="carousel-content">
        <div className="carousel-header">
          <h2 className="carousel-title">{title}</h2>
          <div className="carousel-controls">
            <button
              className={`carousel-btn carousel-btn--left ${
                !canScrollLeft ? "disabled" : ""
              }`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="icon" />
            </button>
            <button
              className={`carousel-btn carousel-btn--right ${
                !canScrollRight ? "disabled" : ""
              }`}
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <ChevronRight className="icon" />
            </button>
          </div>
        </div>

        <div
          className="carousel-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="carousel-track">
            {movies.map((movie) => (
              <div key={movie.id} className="carousel-item">
                <MovieCard
                  movie={movie}
                  showDetails={showDetails}
                  isLarge={isLarge}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-indicators">
          {Array.from(
            { length: Math.ceil(movies.length / itemsPerView) },
            (_, i) => (
              <div
                key={i}
                className={`indicator ${
                  Math.floor(currentIndex / itemsPerView) === i ? "active" : ""
                }`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;
