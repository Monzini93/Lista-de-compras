import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import './Navigation.css';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();
  const { theme, toggleTheme } = useTheme();

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
        <div className="nav-left">
          <span className="nav-icon" aria-hidden="true">
            🛒
          </span>
          <h1 className="nav-title">Lista de Compras</h1>
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="nav-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated && (
            <div className="nav-links">
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Lista
              </Link>
              <Link
                to="/comparacao"
                className={`nav-link ${
                  location.pathname === '/comparacao' ? 'active' : ''
                }`}
              >
                Comparação
              </Link>
              <button onClick={handleLogout} className="nav-logout">
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

