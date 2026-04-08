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

  getToken() {
    return this.token;
  }

  /**
   * Métodos genéricos para o AuthContext e outras chamadas manuais
   */
  public async post<T = any>(path: string, data: any): Promise<{ data: T }> {
    const response = await this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: response };
  }

  public async get<T = any>(path: string): Promise<{ data: T }> {
    const response = await this.request<T>(path, { method: 'GET' });
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
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      // Pega a mensagem de erro do Zod ou a mensagem padrão do servidor
      const msg = error.errors ? Object.values(error.errors).flat()[0] : error.message;
      throw new Error(msg || `Erro ${response.status}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  /**
   * AUTENTICAÇÃO
   * Aqui fazemos a "mágica": o front recebe email, mas manda 'phone' para o backend
   */
  signup(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify({
        phone: data.email, // Tradução para o campo esperado pelo seu backend
        password: data.password
      }),
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({
        phone: data.email, // O seu backend no login.ts espera 'phone'
        password: data.password
      }),
    });
  }

  createStore(data: { name: string; slug: string; phone: string; niche: string; password: string }) {
    return this.request<{ token: string }>('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PRODUTOS
   */
  getProducts() {
    return this.request<Product[]>('/products');
  }

  createProduct(data: Omit<Product, 'id' | 'imageUrl' | 'isActive'>) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, { method: 'DELETE' });
  }

  toggleProductStatus(id: string, isActive: boolean) {
    return this.request<Product>(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  uploadProductImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ imageUrl: string }>(`/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * CATEGORIAS E PEDIDOS
   */
  createCategory(data: { name: string }) {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getOrders() {
    return this.request<Order[]>('/orders');
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * MENU PÚBLICO
   */
  getMenu(slug: string) {
    return this.request<MenuData>(`/menu/${slug}`);
  }

  createOrder(data: CreateOrderData) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
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