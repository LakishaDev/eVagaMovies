import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePlayer from './pages/MoviePlayer';
import CollectionsPage from './pages/CollectionsPage';
import SearchPage from './pages/SearchPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MoviePlayer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
