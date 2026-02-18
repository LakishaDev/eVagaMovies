// Backend se dostupa preko Nginx proxy-a
const API_BASE_URL = "/api";

export const api = {
  async getMovies() {
    const response = await fetch(`${API_BASE_URL}/movies`);
    const data = await response.json();
    return data;
  },

  async getMovie(id) {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`);
    const data = await response.json();
    return data;
  },

  async searchMovies(query) {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data;
  },

  async getCollections() {
    const response = await fetch(`${API_BASE_URL}/collections`);
    const data = await response.json();
    return data;
  },

  async getSubcategories(collection) {
    const response = await fetch(
      `${API_BASE_URL}/collections/${encodeURIComponent(
        collection
      )}/subcategories`
    );
    const data = await response.json();
    return data;
  },

  async getMoviesBySubcategory(collection, subcategory) {
    const response = await fetch(
      `${API_BASE_URL}/collections/${encodeURIComponent(
        collection
      )}/subcategories/${encodeURIComponent(subcategory)}/movies`
    );
    const data = await response.json();
    return data;
  },

  async scanMovies() {
    const response = await fetch(`${API_BASE_URL}/scan`);
    const data = await response.json();
    return data;
  },

  getStreamUrl(id) {
    return `${API_BASE_URL}/stream/${id}`;
  },

  getSubtitleUrl(id) {
    return `${API_BASE_URL}/subtitle/${id}`;
  },

  // 🎬 NOVA FUNKCIONALNOST: Capture thumbnail na specifičnom vremenu
  async captureFrameAtTime(movieId, timestamp) {
    const response = await fetch(
      `${API_BASE_URL}/movies/${movieId}/capture-thumbnail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timestamp }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Greška pri pravljenju thumbnail-a");
    }

    return data;
  },

  // Alias za captureThumbnail (drugi naziv)
  async captureThumbnail(movieId, timestamp) {
    return this.captureFrameAtTime(movieId, timestamp);
  },

  // 🎬 NOVA FUNKCIONALNOST: Dobij informacije o videu
  async getVideoInfo(movieId) {
    const response = await fetch(`${API_BASE_URL}/video-info/${movieId}`);
    const data = await response.json();
    return data;
  },
};
