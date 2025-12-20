import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, Subtitles, Settings } from 'lucide-react';
import SubtitleSettings from './SubtitleSettings';
import WatchProgress from '../utils/watchProgress';

export default function CustomVideoPlayer({ src, subtitleSrc, movie }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSubtitleSettings, setShowSubtitleSettings] = useState(false);

  let controlsTimeout;

  // Load saved watch progress
  useEffect(() => {
    if (movie?.id && videoRef.current) {
      const progress = WatchProgress.get(movie.id);
      if (progress && progress.watchedPercentage < 95 && progress.timestamp > 10) {
        videoRef.current.currentTime = progress.timestamp;
      }
    }
  }, [movie?.id]);

  // Save watch progress periodically
  useEffect(() => {
    if (!movie?.id || !videoRef.current) return;

    const saveProgress = () => {
      if (currentTime > 0 && duration > 0) {
        WatchProgress.save(movie.id, currentTime, duration);
      }
    };

    // Save every 10 seconds while playing
    const interval = setInterval(() => {
      if (playing) {
        saveProgress();
      }
    }, 10000);

    // Save on pause
    const handlePause = () => saveProgress();
    videoRef.current?.addEventListener('pause', handlePause);

    return () => {
      clearInterval(interval);
      videoRef.current?.removeEventListener('pause', handlePause);
      saveProgress(); // Save on unmount
    };
  }, [movie?.id, currentTime, duration, playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffered);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffered);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgressClick = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const skip = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  const toggleSubtitles = () => {
    const tracks = videoRef.current.textTracks;
    if (tracks.length > 0) {
      tracks[0].mode = subtitlesEnabled ? 'hidden' : 'showing';
      setSubtitlesEnabled(!subtitlesEnabled);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    if (playing) {
      controlsTimeout = setTimeout(() => setShowControls(false), 6000);
    }
  };

  const handleKeyPress = (e) => {
    switch(e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        skip(-10);
        break;
      case 'ArrowRight':
        skip(10);
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'm':
        toggleMute();
        break;
      case 's':
        toggleSubtitles();
        break;
      case 'c':
        setShowSubtitleSettings(true);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [playing, subtitlesEnabled]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Subtitle Settings Modal */}
      <SubtitleSettings
        isOpen={showSubtitleSettings}
        onClose={() => setShowSubtitleSettings(false)}
        videoRef={videoRef}
      />

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        style={{ 
          aspectRatio: isFullscreen ? 'auto' : '16/9',
          maxHeight: isFullscreen ? '100vh' : 'none'
        }}
        src={src}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {subtitleSrc && (
          <track
            kind="subtitles"
            src={subtitleSrc}
            srcLang="sr"
            label="Serbian"
            default
          />
        )}
      </video>

      {/* Loading Overlay */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          {/* Film reel spinner */}
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-accent/30 rounded-full animate-spin">
              <div className="absolute top-1/2 left-1/2 w-10 h-10 -mt-5 -ml-5 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" 
                   style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}>
              </div>
            </div>
            
            {/* Decorative dots */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>

          {/* Loading text */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg text-white font-semibold">
              {isBuffering ? 'Buffering' : 'Učitavanje'}
            </span>
            <div className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-secondary animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Play button overlay */}
      {!playing && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <button 
            onClick={togglePlay}
            className="w-20 h-20 flex items-center justify-center bg-accent/90 rounded-full hover:bg-accent transition-all hover:scale-110"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="relative h-2 bg-gray-700 cursor-pointer group/progress"
          onClick={handleProgressClick}
        >
          {/* Buffered */}
          <div 
            className="absolute h-full bg-gray-600 transition-all"
            style={{ width: `${buffered}%` }}
          />
          
          {/* Progress */}
          <div 
            className="absolute h-full bg-accent transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Hover indicator */}
          <div className="absolute inset-0 h-full opacity-0 group-hover/progress:opacity-100 transition-opacity">
            <div className="absolute right-0 w-3 h-3 bg-white rounded-full -top-0.5 transform translate-x-1/2" />
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={togglePlay} 
                className="text-white hover:text-accent transition p-1"
              >
                {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
              </button>
              
              <button 
                onClick={() => skip(-10)} 
                className="text-white hover:text-accent transition p-1"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => skip(10)} 
                className="text-white hover:text-accent transition p-1"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-2 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-accent transition p-1">
                  {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-accent"
                />
              </div>

              <div className="text-sm text-gray-300 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {subtitleSrc && (
                <>
                  <button 
                    onClick={toggleSubtitles}
                    className={`transition p-1 ${
                      subtitlesEnabled ? 'text-accent' : 'text-white hover:text-accent'
                    }`}
                    title="Uključi/Isključi titlove (S)"
                  >
                    <Subtitles className="w-6 h-6" />
                  </button>
                  
                  <button 
                    onClick={() => setShowSubtitleSettings(true)}
                    className="text-white hover:text-accent transition p-1"
                    title="Podešavanja titlova (C)"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-accent transition p-1"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      <div 
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h2 className="text-2xl font-bold text-white">{movie?.title}</h2>
        {movie?.year && <p className="text-gray-300 text-sm mt-1">{movie.year}</p>}
      </div>
    </div>
  );
}
