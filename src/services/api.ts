const API_URL = 'http://localhost:3001/api';

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
      throw new Error('Não autenticado');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.erro || 'Erro na requisição');
  }

  return response.json();
};

// Autenticação
export const auth = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: () => !!getToken(),
};

// Shopping Lists
export const shoppingListAPI = {
  getLists: async (): Promise<ShoppingList[]> => {
    return apiCall('/lista', { requiresAuth: true });
  },

  createList: async (title: string, items: any[] = []): Promise<ShoppingList> => {
    return apiCall('/lista', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ title, items }),
    });
  },

  updateList: async (id: string, title?: string, items?: any[]): Promise<ShoppingList> => {
    return apiCall(`/lista/${id}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify({ title, items }),
    });
  },

  deleteList: async (id: string): Promise<{ ok: boolean }> => {
    return apiCall(`/lista/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },
};
