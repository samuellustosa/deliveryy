const API_BASE = 'http://localhost:3333';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Métodos genéricos para o AuthContext
   */
  public async post<T = any>(path: string, data: any): Promise<{ data: T }> {
    const response = await this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: response };
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Sessão expirada.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro no servidor' }));
      // Pega a mensagem do Zod (Bad Request) ou a mensagem de erro comum
      const msg = error.errors ? Object.values(error.errors).flat()[0] : error.message;
      throw new Error(msg || `Erro ${response.status}`);
    }

    return response.status === 204 ? ({} as T) : response.json();
  }

  // --- AUTENTICAÇÃO ---
  // Agora enviando 'email' para bater com o loginSchema do seu backend
  login(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email, 
        password: data.password
      }),
    });
  }

  signup(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
    });
  }
}

export const api = new ApiClient();

// --- DEFINIÇÕES DE TIPOS ---

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface MenuData {
  store: {
    id: string;
    name: string;
    slug: string;
    phone: string;
    niche: string;
  };
  products: Product[];
  categories: Category[];
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  storeId: string;
  items: { productId: string; quantity: number; price: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}