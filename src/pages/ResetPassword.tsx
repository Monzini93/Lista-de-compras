import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/api';
import '../components/AuthForm.css';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou ausente');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token inválido');
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao redefinir senha';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Senha Redefinida!</h2>
          <div className="auth-success">
            <p>Sua senha foi redefinida com sucesso.</p>
            <p>Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Redefinir Senha</h2>
        <p className="auth-subtitle">Digite sua nova senha</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || !token}
            minLength={6}
          />
          
          <input
            type="password"
            placeholder="Confirmar Nova Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || !token}
            minLength={6}
          />
          
          <button type="submit" disabled={loading || !token} className="auth-button">
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <a href="/login">Voltar para Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
