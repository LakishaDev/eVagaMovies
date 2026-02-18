import { useState, useEffect, useMemo } from "react";
import { api } from "../utils/api";
import MovieCard from "../components/MovieCard";
import {
  FolderOpen,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { sortMovies } from "../utils/movieUtils";

export default function CollectionsPage() {
  const [movies, setMovies] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("title-asc");

  useEffect(() => {
    loadMovies();

    // Refresh data when window gets focus (user returns to tab)
    const handleFocus = () => {
      loadMovies();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loadMovies = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await api.getMovies();
      if (result.success) {
        setMovies(result.data);
        console.log("📊 Loaded movies:", result.data.length);
      }
    } catch (error) {
      console.error("Failed to load movies:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Derive collections and subcategories locally so new implicit categories show up instantly
  const collectionSummary = useMemo(() => {
    const map = new Map();

    for (const movie of movies) {
      const key = movie.collection || "RAZNO";
      if (!map.has(key)) {
        map.set(key, { name: key, count: 0, subcategories: new Map() });
      }

      const entry = map.get(key);
      entry.count += 1;

      if (movie.subcategory) {
        entry.subcategories.set(
          movie.subcategory,
          (entry.subcategories.get(movie.subcategory) || 0) + 1
        );
      }
    }

    const result = Array.from(map.values())
      .map((entry) => ({
        name: entry.name,
        count: entry.count,
        subcategories: Array.from(entry.subcategories.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log("📂 Collections:", result.length);
    result.forEach((c) => {
      if (c.subcategories.length > 0) {
        console.log(
          `  ${c.name}: ${c.count} filmova, ${c.subcategories.length} podkategorija`
        );
      }
    });

    return result;
  }, [movies]);

  const selectedCollectionData = useMemo(
    () => collectionSummary.find((c) => c.name === selectedCollection),
    [collectionSummary, selectedCollection]
  );

  const subcategories = selectedCollectionData?.subcategories || [];

  const filteredMovies = useMemo(() => {
    const filtered = movies.filter((m) => {
      if (!selectedCollection) return true;
      if (m.collection !== selectedCollection) return false;
      if (!selectedSubcategory) return true;
      return m.subcategory === selectedSubcategory;
    });

    return sortMovies(filtered, sortBy);
  }, [movies, selectedCollection, selectedSubcategory, sortBy]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/20 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Pregled
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
              Kolekcije i podkategorije
            </h1>
            <p className="text-gray-300 mt-2">
              {collectionSummary.length} kolekcija · {movies.length} filmova ·{" "}
              {collectionSummary.reduce(
                (sum, c) => sum + c.subcategories.length,
                0
              )}{" "}
              podkategorija
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadMovies(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-secondary/20 hover:bg-secondary/30 border border-secondary/50 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Osveži</span>
            </button>
            {(selectedCollection || selectedSubcategory) && (
              <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Kolekcija:</span>
                  <span className="font-semibold text-white">
                    {selectedCollection || "Sve"}
                  </span>
                </div>
                {selectedSubcategory && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Podkategorija:</span>
                    <span className="font-semibold text-white">
                      {selectedSubcategory}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-gray-300">
          <FolderOpen className="w-5 h-5 text-secondary" />
          <span className="font-semibold">Kolekcije</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setSelectedCollection(null);
              setSelectedSubcategory(null);
            }}
            className={`group px-5 py-3 rounded-xl border text-sm font-semibold transition shadow-sm ${
              !selectedCollection
                ? "bg-secondary text-white border-secondary"
                : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold">
                {movies.length}
              </span>
              <span>Sve kolekcije</span>
            </div>
          </button>

          {collectionSummary.map((collection) => (
            <button
              key={collection.name}
              onClick={() => {
                setSelectedCollection(collection.name);
                setSelectedSubcategory(null);
              }}
              className={`group px-5 py-3 rounded-xl border text-sm font-semibold transition shadow-sm ${
                selectedCollection === collection.name
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold">
                    {collection.count}
                  </span>
                  <span>{collection.name}</span>
                </div>
                {collection.subcategories.length > 0 && (
                  <span className="text-xs opacity-60 ml-8">
                    {collection.subcategories.length}{" "}
                    {collection.subcategories.length === 1
                      ? "podkategorija"
                      : "podkategorije"}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-gray-300">
            <ChevronRight className="w-4 h-4 text-secondary" />
            <span className="font-semibold">Podkategorije</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                !selectedSubcategory
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60 hover:text-white"
              }`}
            >
              Sve
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.name}
                onClick={() => setSelectedSubcategory(sub.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  selectedSubcategory === sub.name
                    ? "bg-secondary text-white border-secondary"
                    : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60 hover:text-white"
                }`}
              >
                <span className="font-semibold">{sub.name}</span>
                <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                  {sub.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-300">
            <SlidersHorizontal className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold">Sortiranje</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy("title-asc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                sortBy === "title-asc"
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60"
              }`}
            >
              Naziv A-Z
            </button>
            <button
              onClick={() => setSortBy("title-desc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                sortBy === "title-desc"
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60"
              }`}
            >
              Naziv Z-A
            </button>
            <button
              onClick={() => setSortBy("year-desc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                sortBy === "year-desc"
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60"
              }`}
            >
              Godina ↓
            </button>
            <button
              onClick={() => setSortBy("year-asc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                sortBy === "year-asc"
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60"
              }`}
            >
              Godina ↑
            </button>
            <button
              onClick={() => setSortBy("size-desc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                sortBy === "size-desc"
                  ? "bg-secondary text-white border-secondary"
                  : "bg-gray-800/80 text-gray-200 border-gray-700 hover:border-secondary/60"
              }`}
            >
              Veličina ↓
            </button>
          </div>
          <div className="text-xs text-gray-400">
            {filteredMovies.length}{" "}
            {filteredMovies.length === 1 ? "film" : "filmova"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Učitavanje...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
