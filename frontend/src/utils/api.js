// Koristi uvek proxy preko Vite dev servera (isti origin)
const API_BASE_URL = '/api';

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
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
  },

  async getCollections() {
    const response = await fetch(`${API_BASE_URL}/collections`);
    const data = await response.json();
    return data;
  },

  async getSubcategories(collection) {
    const response = await fetch(`${API_BASE_URL}/collections/${encodeURIComponent(collection)}/subcategories`);
    const data = await response.json();
    return data;
  },

  async getMoviesBySubcategory(collection, subcategory) {
    const response = await fetch(`${API_BASE_URL}/collections/${encodeURIComponent(collection)}/subcategories/${encodeURIComponent(subcategory)}/movies`);
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
  }
};
