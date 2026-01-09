import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import './Navigation.css';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  // Não mostrar navegação nas páginas de autenticação
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-title">🛒 Lista de Compras</h1>
        <div className="nav-links">
          {isAuthenticated && (
            <>
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
              <button onClick={handleLogout} className="nav-logout">
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

