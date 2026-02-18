import { useState, useEffect } from "react";
import {
  RefreshCw,
  Info,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "../utils/api";

export default function ThumbnailManager() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    loadStats();
    // Refresh svakih 10 sekundi
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/thumbnail-stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (
      !window.confirm(
        "Ovo će regenerisati sve thumbnail-e. Ovo može trajati nekoliko minuta. Nastavi?"
      )
    ) {
      return;
    }

    setRegenerating(true);
    setMessage("⏳ Počelo regenerisanje... Provjerite console za detalje.");
    setMessageType("info");

    try {
      const response = await fetch("/api/regenerate-all-thumbnails", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setMessage(
          "✅ Regenerisanje je pokrenut u background-u. Provjerite server log."
        );
        setMessageType("success");

        // Refresh stats nakon 5 sekundi
        setTimeout(loadStats, 5000);
      }
    } catch (error) {
      setMessage(`❌ Greška: ${error.message}`);
      setMessageType("error");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <Loader className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400">Greška pri učitavanju statistike</p>
      </div>
    );
  }

  const percentageWithThumbnail = Math.round(
    (stats.withThumbnail / stats.totalMovies) * 100
  );

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <RefreshCw className="w-5 h-5 mr-2" />
        Thumbnail Manager
      </h3>

      {/* Statistika */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded p-4">
          <p className="text-gray-400 text-sm">Ukupno Filmova</p>
          <p className="text-white text-2xl font-bold">{stats.totalMovies}</p>
        </div>

        <div className="bg-green-900/20 rounded p-4 border border-green-700/30">
          <p className="text-green-400 text-sm">Sa Thumbnail-om</p>
          <p className="text-green-300 text-2xl font-bold">
            {stats.withThumbnail}
          </p>
        </div>

        <div className="bg-yellow-900/20 rounded p-4 border border-yellow-700/30">
          <p className="text-yellow-400 text-sm">Bez Thumbnail-a</p>
          <p className="text-yellow-300 text-2xl font-bold">
            {stats.withoutThumbnail}
          </p>
        </div>

        <div className="bg-blue-900/20 rounded p-4 border border-blue-700/30">
          <p className="text-blue-400 text-sm">Generisani</p>
          <p className="text-blue-300 text-2xl font-bold">
            {stats.generatedThumbnails}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Pokrivanje</span>
          <span className="text-white font-semibold">
            {percentageWithThumbnail}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${percentageWithThumbnail}%` }}
          />
        </div>
      </div>

      {/* Akcije */}
      <button
        onClick={handleRegenerateAll}
        disabled={regenerating || stats.withoutThumbnail === 0}
        className={`w-full py-3 px-4 rounded font-semibold transition flex items-center justify-center ${
          regenerating || stats.withoutThumbnail === 0
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {regenerating ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Regenerisanje u toku...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regeneriši Sve Nedostajuće ({stats.withoutThumbnail})
          </>
        )}
      </button>

      {/* Info poruke */}
      {message && (
        <div
          className={`mt-4 p-3 rounded flex items-start gap-2 ${
            messageType === "success"
              ? "bg-green-900/30 text-green-300"
              : messageType === "error"
              ? "bg-red-900/30 text-red-300"
              : "bg-blue-900/30 text-blue-300"
          }`}
        >
          {messageType === "success" && (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          {messageType === "error" && (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          {messageType === "info" && (
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-300">
        💡 Savjet: Regenerisavanje je Best-effort. Nekompatibilni formati će
        biti preskočeni.
      </div>
    </div>
  );
}
