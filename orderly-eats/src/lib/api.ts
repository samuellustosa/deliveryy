// orderly-eats/src/lib/api.ts

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

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        if (!window.location.pathname.includes('/login')) {
          this.setToken(null);
          window.location.href = '/login';
          throw new Error('Sessão expirada.');
        }
        const error = await response.json();
        throw new Error(error.message || 'Credenciais inválidas');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro no servidor' }));
        const msg = error.errors ? Object.values(error.errors).flat()[0] : error.message;
        throw new Error(msg || `Erro ${response.status}`);
      }

      return response.status === 204 ? ({} as T) : response.json();
    } catch (err: any) {
      console.error(`Erro na requisição [${path}]:`, err);
      throw err;
    }
  }

  // --- AUTENTICAÇÃO ---
  
  signup(data: { email: string; password: string }) {
    return this.request<{ token: string; message: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- PRODUTOS ---
  async getProducts() {
    return this.request<Product[]>('/products');
  }

  async createProduct(data: Partial<Product>) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleProductStatus(id: string, isActive: boolean) {
    return this.request<void>(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async uploadProductImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<void>(`/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  // --- LOJAS E CATEGORIAS ---
  async getStores() {
    return this.request<any[]>('/stores');
  }

  async createStore(data: any) {
    return this.request<{ storeId: string; message: string }>('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCategories() {
    return this.request<Category[]>('/categories');
  }

  async createCategory(data: { name: string }) {
    return this.request<{ categoryId: string; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- BANNERS ---
  async getBanners() {
    return this.request<Banner[]>('/banners');
  }

  async createBanner(data: { imageUrl: string; link?: string }) {
    return this.request<Banner>('/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteBanner(id: string) {
    return this.request<void>(`/banners/${id}`, {
      method: 'DELETE',
    });
  }

  // --- MENU PÚBLICO ---
  async getMenu(slug: string) {
    return this.request<MenuData>(`/menu/${slug}`);
  }

  // --- PEDIDOS ---
  async getOrders(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request<Order[]>(`/orders${query}`, { method: 'GET' });
  }

  async createOrder(data: CreateOrderData) {
    return this.request<void>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.request<void>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
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
  imageUrl?: string | null;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  products?: Product[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  storeId: string;
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
    deliveryFee: number;
  };
  products: Product[];
  categories: Category[];
  banners: Banner[];
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  type: string;        // NOVO: 'DELIVERY', 'PICKUP' ou 'ONSITE'
  zipCode?: string;    // NOVO
  street?: string;     // NOVO
  number?: string;     // NOVO
  complement?: string; // NOVO
  reference?: string;  // NOVO
  city?: string;       // NOVO
  state?: string;      // NOVO
  deliveryFee: number; // NOVO
  address: string;     // Mantido para compatibilidade ou resumo
  total: number;
  storeId: string;
  items: { productId: string; quantity: number; price: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}