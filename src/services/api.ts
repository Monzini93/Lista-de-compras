// Usar sempre /api relativo (funciona no Vercel)
const API_URL = '/api';

interface AuthResponse {
  ok: boolean;
  token?: string;
  userId?: string;
  erro?: string;
}

interface ShoppingList {
  id: string;
  title: string;
  items: any[];
  userId: string;
  createdAt: string;
}

// Obter token do localStorage
const getToken = () => localStorage.getItem('auth_token');

// Mensagens de erro em português
const getErrorMessage = (error: any): string => {
  if (error instanceof TypeError) {
    const message = error.message || '';
    if (typeof message === 'string' && message.includes('Failed to fetch')) {
      return `Erro de conexão: servidor não está respondendo. Verifique a URL da API.`;
    }
    return 'Erro de rede: ' + String(message);
  }
  
  if (error instanceof Error) {
    return String(error.message || 'Erro desconhecido');
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Erro desconhecido';
};

// Fazer requisição com autenticação
const apiCall = async (
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
) => {
  const { requiresAuth = false, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Você não está autenticado');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Erro: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.erro || error.message || errorMessage;
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (parseError) {
      // Se a resposta não for JSON válido, retorna null ou objeto vazio
      return null;
    }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Autenticação
export const auth = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: () => !!getToken(),

  forgotPassword: async (email: string): Promise<{ ok: boolean; mensagem: string }> => {
    try {
      return await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  resetPassword: async (token: string, password: string): Promise<{ ok: boolean; mensagem: string }> => {
    try {
      return await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// Shopping Lists
export const shoppingListAPI = {
  getLists: async (): Promise<ShoppingList[]> => {
    try {
      return await apiCall('/lista', { requiresAuth: true });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  createList: async (title: string, items: any[] = []): Promise<ShoppingList> => {
    try {
      return await apiCall('/lista', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ title, items }),
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateList: async (id: string, title?: string, items?: any[]): Promise<ShoppingList> => {
    try {
      return await apiCall(`/lista/${id}`, {
        method: 'PUT',
        requiresAuth: true,
        body: JSON.stringify({ title, items }),
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteList: async (id: string): Promise<{ ok: boolean }> => {
    try {
      return await apiCall(`/lista/${id}`, {
        method: 'DELETE',
        requiresAuth: true,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
