import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-title">🛒 Lista de Compras</h1>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            📝 Lista
          </Link>
          <Link
            to="/comparacao"
            className={`nav-link ${
              location.pathname === '/comparacao' ? 'active' : ''
            }`}
          >
            💰 Comparação
          </Link>
        </div>
      </div>
    </nav>
  );
};

