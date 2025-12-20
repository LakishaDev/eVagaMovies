import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import MovieCard from '../components/MovieCard';
import { FolderOpen, ChevronRight } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
    loadMovies();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadSubcategories(selectedCollection);
    } else {
      setSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [selectedCollection]);

  const loadCollections = async () => {
    try {
      const result = await api.getCollections();
      if (result.success) {
        setCollections(result.data);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const loadSubcategories = async (collection) => {
    try {
      const result = await api.getSubcategories(collection);
      if (result.success) {
        setSubcategories(result.data);
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
    }
  };

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

  const filteredMovies = movies.filter(m => {
    if (!selectedCollection) return true;
    if (m.collection !== selectedCollection) return false;
    if (!selectedSubcategory) return true;
    return m.subcategory === selectedSubcategory;
  });

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Kolekcije Filmova</h1>

      {/* Collections */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => {
            setSelectedCollection(null);
            setSelectedSubcategory(null);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            !selectedCollection
              ? 'bg-accent text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Sve ({movies.length})
        </button>

        {collections.map(collection => (
          <button
            key={collection.collection}
            onClick={() => {
              setSelectedCollection(collection.collection);
              setSelectedSubcategory(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedCollection === collection.collection
                ? 'bg-accent text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>{collection.collection} ({collection.count})</span>
            </div>
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <ChevronRight className="w-4 h-4" />
            <span className="text-sm font-semibold">Podkategorije:</span>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                !selectedSubcategory
                  ? 'bg-secondary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sve
            </button>
            {subcategories.map(sub => (
              <button
                key={sub.subcategory}
                onClick={() => setSelectedSubcategory(sub.subcategory)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedSubcategory === sub.subcategory
                    ? 'bg-secondary text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {sub.subcategory} ({sub.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Učitavanje...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
