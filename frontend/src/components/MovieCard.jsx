import React from "react";
import { Link } from "react-router-dom";
import { Play, Calendar, Film, Award, HardDrive } from "lucide-react";
import WatchProgress from "../utils/watchProgress";
import {
  cleanMovieTitle,
  formatFileSize,
  getMovieYear,
} from "../utils/movieUtils";

function MovieCard({ movie }) {
  const progress = WatchProgress.get(movie.id);
  const watchedPercentage = progress ? progress.watchedPercentage : 0;
  const displayTitle = cleanMovieTitle(movie.title);
  const movieYear = getMovieYear(movie);

  const thumbnailUrl = movie.thumbnail_path
    ? `http://${window.location.hostname}:3001/api/thumbnail/${movie.id}`
    : null;

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative bg-gray-800/50 rounded-lg overflow-hidden hover:ring-2 hover:ring-secondary transition-all duration-300 hover:scale-105"
    >
      <div className="aspect-[2/3] bg-gradient-to-br from-primary to-dark flex items-center justify-center relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        <div
          className="absolute inset-0 bg-gradient-to-br from-primary to-dark items-center justify-center"
          style={{ display: thumbnailUrl ? "none" : "flex" }}
        >
          <Film className="w-20 h-20 text-gray-600 group-hover:text-gray-500 transition" />
        </div>

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-accent rounded-full p-4">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {movie.quality && (
          <div className="absolute top-2 right-2 bg-accent px-2 py-1 rounded text-xs font-bold">
            {movie.quality}
          </div>
        )}

        {/* Watch Progress Indicator */}
        {watchedPercentage >= 5 && watchedPercentage < 95 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${watchedPercentage}%` }}
            />
          </div>
        )}

        {/* Watched Badge */}
        {watchedPercentage >= 95 && (
          <div className="absolute top-2 left-2 bg-green-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
            ✓ Odgledano
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-base text-white line-clamp-2 group-hover:text-secondary transition leading-tight min-h-[2.5rem]">
          {displayTitle}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {movieYear && (
            <span className="inline-flex items-center gap-1 bg-accent/20 border border-accent/30 text-accent text-xs px-2 py-0.5 rounded-md font-semibold">
              <Calendar className="w-3 h-3" />
              {movieYear}
            </span>
          )}

          {movie.quality && (
            <span className="inline-flex items-center gap-1 bg-secondary/20 border border-secondary/30 text-secondary text-xs px-2 py-0.5 rounded-md font-semibold">
              <Award className="w-3 h-3" />
              {movie.quality}
            </span>
          )}

          {movie.file_size && (
            <span className="inline-flex items-center gap-1 bg-gray-700/50 border border-gray-600/30 text-gray-300 text-xs px-2 py-0.5 rounded-md">
              <HardDrive className="w-3 h-3" />
              {formatFileSize(movie.file_size)}
            </span>
          )}
        </div>

        {(movie.collection || movie.subcategory) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {movie.collection && (
              <span className="inline-block bg-primary/30 border border-primary/40 text-primary-foreground text-xs px-2 py-0.5 rounded">
                {movie.collection}
              </span>
            )}
            {movie.subcategory && (
              <span className="inline-block bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs px-2 py-0.5 rounded">
                {movie.subcategory}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default React.memo(MovieCard);
