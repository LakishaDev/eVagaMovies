import { useState, useRef } from "react";
import { Camera, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { api } from "../utils/api";

export default function ThumbnailSelector({ movieId, videoRef, duration }) {
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // 'success', 'error', 'info'
  const [timeInput, setTimeInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Konvertuj HH:MM:SS ili MM:SS u sekunde
  const parseTime = (timeStr) => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // Samo sekunde
      return parts[0];
    }
    return null;
  };

  // Konvertuj sekunde u HH:MM:SS format
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Koristi trenutno vrijeme iz videa
  const captureCurrentTime = async () => {
    if (!videoRef?.current) return;
    if (!videoRef?.current?.videoElement) return;

    const currentTime = Math.floor(videoRef.current.videoElement.currentTime);
    await captureThumbnail(currentTime);
  };

  // Koristi uneseno vrijeme
  const captureInputTime = async () => {
    const seconds = parseTime(timeInput);
    if (seconds === null || seconds < 0) {
      setMessage("❌ Nevaljano vrijeme! Koristite format: MM:SS ili HH:MM:SS");
      setMessageType("error");
      return;
    }

    if (seconds > duration) {
      setMessage(
        `❌ Vrijeme je veće od trajanja filma (${formatTime(duration)})`
      );
      setMessageType("error");
      return;
    }

    await captureThumbnail(seconds);
  };

  const captureThumbnail = async (timestamp) => {
    setCapturing(true);
    setMessage(null);

    try {
      setMessage(`⏳ Pravljenje thumbnail-a na ${formatTime(timestamp)}...`);
      setMessageType("info");

      const response = await api.captureThumbnail(movieId, timestamp);

      if (response.success) {
        setMessage("✅ Thumbnail je uspješno napravljen!");
        setMessageType("success");
        setTimeInput("");

        // Prikaži preview
        const imagePath = `/api/thumbnail/${movieId}?t=${Date.now()}`;
        setPreview(imagePath);
        setShowPreview(true);

        // Očisti poruku nakon 3 sekunde
        setTimeout(() => {
          setMessage(null);
          setShowPreview(false);
        }, 3000);

        // Reload page nakon 2 sekunde da se vidi novi thumbnail
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
    } catch (error) {
      setMessage(`❌ Greška: ${error.message}`);
      setMessageType("error");
      console.error("Capture error:", error);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mt-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Camera className="w-5 h-5 mr-2" />
        Prilagođeni Thumbnail
      </h3>

      <p className="text-gray-400 text-sm mb-4">
        Odaberi trenutak u videu da bude naslovnica filma
      </p>

      {/* Trenutno vrijeme videa */}
      <div className="bg-gray-700/50 rounded p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-gray-300 text-sm">Trenutno vrijeme:</span>
          </div>
          <span className="text-white font-mono text-lg">
            {videoRef?.current?.videoElement
              ? `${Math.floor(
                  videoRef.current.videoElement.currentTime
                )}s / ${Math.floor(duration)}s`
              : "Učitavanje..."}
          </span>
        </div>

        <button
          onClick={captureCurrentTime}
          disabled={capturing || !videoRef?.current?.videoElement}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                     text-white py-2 px-4 rounded font-semibold transition
                     flex items-center justify-center"
        >
          {capturing ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Pravljenje...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Koristi Trenutno Vrijeme
            </>
          )}
        </button>
      </div>

      {/* Unosim određeno vrijeme */}
      <div className="bg-gray-700/50 rounded p-4">
        <label className="text-gray-300 text-sm block mb-2">
          Ili unesi vrijeme (MM:SS ili HH:MM:SS)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && captureInputTime()}
            placeholder="npr: 1:23 ili 1:23:45"
            disabled={capturing}
            className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm
                       placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={captureInputTime}
            disabled={capturing || !timeInput}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                       text-white px-4 py-2 rounded font-semibold transition
                       flex items-center justify-center whitespace-nowrap"
          >
            {capturing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Napravi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Poruke */}
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
            <Loader className="w-5 h-5 mt-0.5 flex-shrink-0 animate-spin" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Preview */}
      {showPreview && preview && (
        <div className="mt-4 p-3 rounded bg-gray-700/50 border border-blue-500/30">
          <p className="text-gray-300 text-sm mb-2">Novi thumbnail:</p>
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-xs h-auto rounded"
          />
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-300">
        💡 Savjet: Pauzira video na mjestu gdje želiš da bude thumbnail, pa
        klikni "Koristi Trenutno Vrijeme"
      </div>
    </div>
  );
}
