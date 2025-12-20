import { Link } from 'react-router-dom';
import { Film, Home, FolderOpen, Search } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-secondary transition">
              <Film className="w-8 h-8" />
              <span className="text-2xl font-bold">eVaga<span className="text-accent">Movies</span></span>
            </Link>
            
            <div className="flex space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
              >
                <Home className="w-5 h-5" />
                <span>Početna</span>
              </Link>
              
              <Link 
                to="/collections" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
              >
                <FolderOpen className="w-5 h-5" />
                <span>Kolekcije</span>
              </Link>
              
              <Link 
                to="/search" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
              >
                <Search className="w-5 h-5" />
                <span>Pretraga</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-900/50 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-400">
          <p>eVagaMovies - Lokalni film server © 2025</p>
        </div>
      </footer>
    </div>
  );
}
