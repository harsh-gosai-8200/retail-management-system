import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const BASE_URL = "/api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    role: string;
    userId: number;
    username: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    businessName?: string;
    address?: string;
    gstNumber?: string;
    shopName?: string;
    latitude?: number;
    longitude?: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    skuCode: string;
    stockQuantity: number;
    unit: string;
    wholesalerId: number;
    wholesalerName?: string;
    imageUrl: string | null;
    isActive: boolean;
}

// PaginatedResponse is deprecated, use SpringPage
export interface PaginatedResponse<T> {
    products: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface SpringPage<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    empty: boolean;
}

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        });

        // Interceptor to handle responses and errors
        this.axiosInstance.interceptors.response.use(
            (response) => {
                // If the response is 204 No Content, return empty object
                if (response.status === 204) {
                    return {} as any;
                }
                return response.data;
            },
            (error) => {
                const message = error.response?.data?.message || error.message || "API Error";
                throw new Error(message);
            }
        );
    }

    private async request<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            return await this.axiosInstance.request<any, T>({
                url: endpoint,
                ...config,
            });
        } catch (error) {
            throw error;
        }
    }

    // Auth
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return this.request<LoginResponse>("/auth/login", {
            method: "POST",
            data: credentials,
        });
    }

    async register(data: RegisterRequest): Promise<void> {
        return this.request<void>("/auth/register", {
            method: "POST",
            data: data,
        });
    }

    // Products
    async getProducts(
        wholesalerId: number = 1,
        page: number = 0,
        size: number = 10,
        sortBy: string = "name",
        sortDir: string = "asc"
    ): Promise<SpringPage<Product>> {
        return this.request<SpringPage<Product>>(
            `/products`, {
            params: {
                wholesalerId,
                page,
                size,
                sort: `${sortBy},${sortDir}`
            }
        });
    }

    async getProduct(wholesalerId: number, productId: number): Promise<Product> {
        return this.request<Product>(`/products/${productId}`);
    }

    async createProduct(wholesalerId: number, data: Partial<Product>): Promise<Product> {
        return this.request<Product>(`/products`, {
            method: "POST",
            data: data,
            params: { wholesalerId }
        });
    }

    async updateProduct(wholesalerId: number, productId: number, data: Partial<Product>): Promise<Product> {
        return this.request<Product>(`/products/${productId}`, {
            method: "PUT",
            data: data,
            params: { wholesalerId }
        });         
    }

    async deleteProduct(wholesalerId: number, productId: number): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/products/${productId}`, {
            method: "DELETE",
            // No wholesalerId required for delete based on postman collection, but good to check if backend enforces it.
            // keeping it simple as per collection item 15
        });
    }

    async searchProducts(wholesalerId: number, keyword: string, page: number = 0, size: number = 10): Promise<SpringPage<Product>> {
        return this.request<SpringPage<Product>>(
            `/products`, {
            params: {
                wholesalerId,
                search: keyword,
                page,
                size
            }
        });
    }

    async getProductsByCategory(wholesalerId: number, category: string, page: number = 0, size: number = 10): Promise<SpringPage<Product>> {
        return this.request<SpringPage<Product>>(
            `/products`, {
            params: {
                wholesalerId,
                category,
                page,
                size
            }
        });
    }

    async toggleProductStatus(wholesalerId: number, productId: number, status: boolean): Promise<Product> {
        return this.request<Product>(`/products/${productId}/status`, {
            method: "PATCH",
            params: { status }
        });
    }

    async getCategories(wholesalerId: number = 1): Promise<string[]> {
        return this.request<string[]>(`/products/categories`, {
            params: { wholesalerId }
        });
    }
}

export const api = new ApiService();
