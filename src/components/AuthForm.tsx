import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import './AuthForm.css';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Por favor, preencha todos os campos');
      }

      if (mode === 'login') {
        await auth.login(email, password);
        navigate('/');
      } else {
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
        await auth.register(email, password);
        setEmail('');
        setPassword('');
        setError(''); 
        alert('✅ Cadastro realizado com sucesso! Agora faça login.');
        navigate('/login');
      }
      
      onSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      console.error('Erro de autenticação:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{mode === 'login' ? 'Login' : 'Cadastro'}</h2>
        
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
          
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' ? (
            <p>Não tem conta? <a href="/register">Cadastre-se</a></p>
          ) : (
            <p>Já tem conta? <a href="/login">Faça login</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
