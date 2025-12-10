// API Service - Comunicação com o backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tipos baseados no swagger.yaml
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
  is_admin?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Helper para obter o token do localStorage de forma segura
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

// Helper para criar headers com autenticação
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Classe de erro customizada para tratar respostas da API
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Função genérica para fazer requisições
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  // Se for 204 No Content, retorna undefined
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Helper para normalizar o objeto produto
const normalizeProduct = (p: any): Product => {
  return {
    ...p,
    id: p.id || p.uuid || p._id,
  };
};

// ============ Auth API ============

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  register: async (email: string, password: string): Promise<{ message: string; user: User }> => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// ============ Products API ============

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const data = await fetchApi<any[]>('/products');
    return data.map(normalizeProduct);
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const data = await fetchApi<any>(`/products/${id}`);
      return normalizeProduct(data);
    } catch (error) {
      console.warn(`Falha ao buscar produto ${id} diretamente. Tentando encontrar na lista geral...`, error);
      // Fallback: Busca todos e filtra
      const allProducts = await productsApi.getAll();
      const product = allProducts.find(p => p.id === id);
      
      if (product) {
        return product;
      }
      
      throw error;
    }
  },

  create: async (formData: FormData): Promise<Product> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return normalizeProduct(data);
  },

  update: async (id: string, formData: FormData): Promise<Product> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return normalizeProduct(data);
  },

  delete: async (id: string): Promise<void> => {
    return fetchApi(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ Favorites API ============

export const favoritesApi = {
  getAll: async (): Promise<Product[]> => {
    return fetchApi<Product[]>('/favorites');
  },

  add: async (productId: string): Promise<{ message: string; favorite: Favorite }> => {
    return fetchApi('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  remove: async (productId: string): Promise<{ message: string }> => {
    return fetchApi(`/favorites/${productId}`, {
      method: 'DELETE',
    });
  },

  check: async (productId: string): Promise<{ isFavorite: boolean }> => {
    return fetchApi<{ isFavorite: boolean }>(`/favorites/check/${productId}`);
  },

  count: async (): Promise<{ count: number }> => {
    return fetchApi<{ count: number }>('/favorites/count');
  },

  clearAll: async (): Promise<{ message: string }> => {
    return fetchApi('/favorites', {
      method: 'DELETE',
    });
  },
};
