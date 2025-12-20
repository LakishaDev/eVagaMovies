import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import MovieCard from '../components/MovieCard';
import { Film, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const result = await api.getMovies();
      if (result.success) {
        setMovies(result.data);
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await api.scanMovies();
      await loadMovies();
    } catch (error) {
      console.error('Failed to scan movies:', error);
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Film className="w-16 h-16 text-secondary animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Učitavanje filmova...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">
          Svi Filmovi <span className="text-secondary">({movies.length})</span>
        </h1>
        
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center space-x-2 bg-accent hover:bg-accent/80 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
        >
          <RefreshCw className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Skeniranje...' : 'Skeniraj Filmove'}</span>
        </button>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Nema pronađenih filmova</h2>
          <p className="text-gray-500 mb-6">Kliknite na "Skeniraj Filmove" da učitate filmove iz foldera</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
