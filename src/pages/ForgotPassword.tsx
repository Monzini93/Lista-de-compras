import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import '../components/AuthForm.css';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Por favor, informe seu email');
      }

      await auth.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Email Enviado</h2>
          <div className="auth-success">
            <p>Se o email existir em nosso sistema, você receberá instruções para recuperar sua senha.</p>
            <p className="auth-note">Verifique sua caixa de entrada e spam.</p>
          </div>
          <button onClick={() => navigate('/login')} className="auth-button">
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Senha</h2>
        <p className="auth-subtitle">Digite seu email para receber instruções de recuperação</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Enviando...' : 'Enviar Instruções'}
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
