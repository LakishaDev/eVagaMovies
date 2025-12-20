import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowLeft } from 'lucide-react';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import MovieLoader from '../components/MovieLoader';

export default function MoviePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    setLoading(true);
    try {
      const result = await api.getMovie(id);
      if (result.success) {
        setMovie(result.data);
      }
    } catch (error) {
      console.error('Failed to load movie:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <MovieLoader />;
  }

  if (!movie) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Film nije pronađen</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Nazad</span>
      </button>

      <CustomVideoPlayer
        src={api.getStreamUrl(id)}
        subtitleSrc={movie.subtitle_path ? api.getSubtitleUrl(id) : null}
        movie={movie}
      />

      <div className="mt-8 bg-gray-800/50 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {movie.year && (
            <div>
              <span className="text-gray-400">Godina:</span>
              <p className="text-white font-semibold">{movie.year}</p>
            </div>
          )}
          
          {movie.quality && (
            <div>
              <span className="text-gray-400">Kvalitet:</span>
              <p className="text-white font-semibold">{movie.quality}</p>
            </div>
          )}
          
          {movie.format && (
            <div>
              <span className="text-gray-400">Format:</span>
              <p className="text-white font-semibold">{movie.format}</p>
            </div>
          )}
          
          {movie.audio && (
            <div>
              <span className="text-gray-400">Audio:</span>
              <p className="text-white font-semibold">{movie.audio}</p>
            </div>
          )}
          
          {movie.collection && (
            <div>
              <span className="text-gray-400">Kolekcija:</span>
              <p className="text-white font-semibold">{movie.collection}</p>
            </div>
          )}
          
          {movie.source && (
            <div>
              <span className="text-gray-400">Izvor:</span>
              <p className="text-white font-semibold">{movie.source}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
