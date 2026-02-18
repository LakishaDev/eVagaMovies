import { useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThumbnailManager from "../components/ThumbnailManager";

export default function AdminPage() {
  const navigate = useNavigate();
  const [adminPassword] = useState(null); // TODO: Implementiraj authentication

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Nazad</span>
      </button>

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          Admin Panel
        </h1>
        <p className="text-gray-400 mt-2">
          Upravljanje thumbnail-ima i ostalim postavkama
        </p>
      </div>

      {/* Thumbnail Manager */}
      <ThumbnailManager />

      {/* Dodatne sekcije */}
      <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">📌 Dostupni Alati</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>
            ✅ Thumbnail Regeneration - Regeneriši sve nedostajuće thumbnail-e
          </li>
          <li>
            ✅ Thumbnail Capture - Klikni na film i odaberi određeni frame
          </li>
          <li>
            ✅ Video Info - Pregled metapodataka videa (trajanje, codec, itd.)
          </li>
          <li>
            ✅ Batch Operations - Batch API endpoint-i za napredne operacije
          </li>
        </ul>
      </div>

      {/* API Dokumentacija */}
      <div className="mt-8 bg-blue-900/20 rounded-lg p-6 border border-blue-700/30">
        <h3 className="text-lg font-bold text-blue-300 mb-3">
          🔌 API Endpoint-i
        </h3>
        <pre className="bg-gray-900 rounded p-3 text-xs text-gray-300 overflow-x-auto">
          {`POST   /api/movies/:id/capture-thumbnail
       Body: { timestamp: number }
       
GET    /api/video-info/:id
       
GET    /api/thumbnail-stats
       
GET    /api/movies-without-thumbnail
       
POST   /api/regenerate-all-thumbnails
       
POST   /api/movies/:id/regenerate-thumbnail
       
DELETE /api/movies/:id/thumbnail`}
        </pre>
      </div>
    </div>
  );
}
