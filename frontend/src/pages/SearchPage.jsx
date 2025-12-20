import { useState } from 'react';
import { api } from '../utils/api';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const result = await api.searchMovies(query);
      if (result.success) {
        setResults(result.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Pretraga Filmova</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži filmove po naslovu ili kolekciji..."
            className="w-full pl-14 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg transition"
          >
            Pretraži
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-20 text-gray-400">Pretraga...</div>
      )}

      {!loading && searched && (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">
            Rezultati: <span className="text-secondary">{results.length}</span>
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Nema rezultata za "{query}"
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !searched && (
        <div className="text-center py-20 text-gray-400">
          <SearchIcon className="w-24 h-24 mx-auto mb-4 text-gray-600" />
          <p>Unesite pojam za pretragu filmova</p>
        </div>
      )}
    </div>
  );
}
