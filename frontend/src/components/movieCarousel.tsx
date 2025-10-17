import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  const sliderRef = useRef<Slider>(null);

  if (!movies || movies.length === 0) {
    return null;
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: isLarge ? 4 : 6,
    slidesToScroll: isLarge ? 4 : 6,
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: isLarge ? 3 : 5,
          slidesToScroll: isLarge ? 3 : 5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: isLarge ? 2 : 4,
          slidesToScroll: isLarge ? 2 : 4,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  return (
    <div className={`movie-carousel${isLarge ? " movie-carousel--large" : ""}`}>
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
              className="carousel-btn carousel-btn--left"
              onClick={() => sliderRef.current?.slickPrev()}
            >
              <ChevronLeft className="icon" />
            </button>
            <button
              className="carousel-btn carousel-btn--right"
              onClick={() => sliderRef.current?.slickNext()}
            >
              <ChevronRight className="icon" />
            </button>
          </div>
        </div>

        <Slider ref={sliderRef} {...settings}>
          {movies.map((movie) => (
            <div key={movie.id} className="carousel-item">
              <MovieCard
                movie={movie}
                showDetails={showDetails}
                isLarge={isLarge}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default MovieCarousel;
