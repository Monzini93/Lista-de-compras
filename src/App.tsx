import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ShoppingList } from './pages/ShoppingList';
import { PriceComparison } from './pages/PriceComparison';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ShoppingList />} />
            <Route path="/comparacao" element={<PriceComparison />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

