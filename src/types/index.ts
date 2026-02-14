export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory?: string | null;
  image_url: string;
  is_featured?: boolean;
  description?: string;
  created_at?: string;
}

export interface ProductList {
  products: Product[];
  total: number;
  page: number;
  maxResults: number;
}

export interface User {
  id: string;
  email: string;
  role?: 'user' | 'admin';
  created_at?: string;
}

export interface UserList {
  users: User[];
  total: number;
  page: number;
  maxResults: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CategoryInfo {
  category: string;
  subcategories: string[];
  productCount: number;
}

export interface ProductsQueryParams {
  maxResults?: number;
  page?: number;
  category?: string;
  subcategory?: string | string[];
}

export interface UsersQueryParams {
  maxResults?: number;
  page?: number;
}
