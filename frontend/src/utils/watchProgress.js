// Utility functions for managing movie watch progress

export const WatchProgress = {
  // Save watch progress
  save(movieId, currentTime, duration) {
    if (!movieId || currentTime <= 0 || duration <= 0) return;
    
    const watchedPercentage = (currentTime / duration) * 100;
    const progress = {
      timestamp: currentTime,
      duration: duration,
      watchedPercentage: watchedPercentage,
      lastWatched: new Date().toISOString()
    };
    
    localStorage.setItem(`movie_progress_${movieId}`, JSON.stringify(progress));
    
    // Also update watch history list
    this.addToHistory(movieId, progress);
  },

  // Get saved progress for a movie
  get(movieId) {
    if (!movieId) return null;
    
    const saved = localStorage.getItem(`movie_progress_${movieId}`);
    return saved ? JSON.parse(saved) : null;
  },

  // Clear progress for a movie
  clear(movieId) {
    if (!movieId) return;
    localStorage.removeItem(`movie_progress_${movieId}`);
  },

  // Add movie to watch history
  addToHistory(movieId, progress) {
    const history = this.getHistory();
    
    // Remove existing entry if present
    const filtered = history.filter(item => item.movieId !== movieId);
    
    // Add to beginning
    filtered.unshift({
      movieId,
      ...progress
    });
    
    // Keep only last 50 movies
    const trimmed = filtered.slice(0, 50);
    
    localStorage.setItem('watch_history', JSON.stringify(trimmed));
  },

  // Get watch history
  getHistory() {
    const history = localStorage.getItem('watch_history');
    return history ? JSON.parse(history) : [];
  },

  // Get continue watching list (movies watched but not finished)
  getContinueWatching() {
    const history = this.getHistory();
    return history.filter(item => 
      item.watchedPercentage >= 5 && item.watchedPercentage < 95
    );
  },

  // Check if movie is finished
  isFinished(movieId) {
    const progress = this.get(movieId);
    return progress && progress.watchedPercentage >= 95;
  },

  // Get watched percentage
  getPercentage(movieId) {
    const progress = this.get(movieId);
    return progress ? progress.watchedPercentage : 0;
  },

  // Format timestamp for display
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // Clear all watch history
  clearAll() {
    // Get all keys related to movie progress
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('movie_progress_')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('watch_history');
  }
};

export default WatchProgress;
