import { Link } from 'react-router-dom';
import { Play, Calendar, Film, Award } from 'lucide-react';
import WatchProgress from '../utils/watchProgress';

export default function MovieCard({ movie }) {
  const progress = WatchProgress.get(movie.id);
  const watchedPercentage = progress ? progress.watchedPercentage : 0;
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const gb = (bytes / (1024 ** 3)).toFixed(2);
    return `${gb} GB`;
  };

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
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary to-dark items-center justify-center"
          style={{ display: thumbnailUrl ? 'none' : 'flex' }}
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
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-white truncate group-hover:text-secondary transition">
          {movie.title}
        </h3>
        
        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
          {movie.year && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{movie.year}</span>
            </div>
          )}
          
          {movie.format && (
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4" />
              <span>{movie.format}</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.collection && (
            <span className="inline-block bg-primary/50 text-xs px-2 py-1 rounded">
              {movie.collection}
            </span>
          )}
          {movie.subcategory && (
            <span className="inline-block bg-secondary/50 text-xs px-2 py-1 rounded">
              {movie.subcategory}
            </span>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {formatFileSize(movie.file_size)}
        </div>
      </div>
    </Link>
  );
}
