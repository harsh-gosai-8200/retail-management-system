import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "http://localhost:8080/api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    tokenType?: string;
    role: string;
    userId: number;
    roleId?: number;
    email?: string;
    username: string;
    businessName?: string | null;
    shopName?: string | null;
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
    id?: number;
    version?: number;
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
    active: boolean;
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

        // Attach auth token to every request
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("jwt_token");
                    if (token) {
                        if (!config.headers) {
                            // headers are always defined at runtime, cast to satisfy TS
                            config.headers = {} as any;
                        }
                        (config.headers as any).Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
        );

        // Interceptor to handle responses and errors
        this.axiosInstance.interceptors.response.use(
            (response: any) => {
                // If the response is 204 No Content, return empty object
                if (response.status === 204) {
                    return {} as any;
                }
                return response.data;
            },
            (error: any) => {
                const message = this.extractErrorMessage(error);
                throw new Error(message);
            }
        );
    }

    private extractErrorMessage(error: any): string {
        const data = error?.response?.data;

        if (typeof data === "string" && data.trim().length > 0) {
            return data.trim();
        }

        if (data && typeof data === "object") {
            const candidate = data.message || data.error || data.title || data.detail;
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate.trim();
            }

            if (Array.isArray(data.errors) && data.errors.length > 0) {
                const flattened = data.errors
                    .map((item: any) => {
                        if (typeof item === "string") return item;
                        if (item?.message) return item.message;
                        if (item?.defaultMessage) return item.defaultMessage;
                        return null;
                    })
                    .filter(Boolean)
                    .join(", ");

                if (flattened) return flattened;
            }

            if (data.errors && typeof data.errors === "object") {
                const fieldErrors = Object.entries(data.errors)
                    .map(([field, value]) =>
                        `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`
                    )
                    .join(", ");

                if (fieldErrors) return fieldErrors;
            }
        }

        return error?.message || "API Error";
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
        wholesalerId: number,
        page: number = 0,
        size: number = 10,
        sortBy: string = "name",
        sortDir: string = "asc"
    ): Promise<SpringPage<Product>> {
        const res = await this.request<any>(
            `/products`,
            { params: { wholesalerId, page, size, sort: `${sortBy},${sortDir}` } }
        );

        return {
            content: res.products || [],
            totalPages: res.totalPages,
            totalElements: res.totalItems,
            size: res.pageSize,
            number: res.currentPage,
            empty: !res.products || res.products.length === 0,
        };
    }

    async getProduct(productId: number): Promise<Product> {
        return this.request<Product>(`/products/${productId}`);
    }

    async createProduct(wholesalerId: number, data: Partial<Product>): Promise<Product> {
        const { id, version, ...payload } = data;

        return this.request<Product>(`/products`, {
            method: "POST",
            data: payload,
            params: { wholesalerId }
        });
    }

    async updateProduct(wholesalerId: number, productId: number, data: Partial<Product>): Promise<Product> {
        return this.request<Product>(`/products/${productId}`, {
            method: "PUT",
            data: {
                ...data,
                imageUrl: data.imageUrl || "", // if imageUrl is not provided, set it to an empty string
            },
            params: { wholesalerId }
        });
    }

    async deleteProduct(productId: number): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/products/${productId}`, {
            method: "DELETE",
            // No wholesalerId required for delete based on postman collection, but good to check if backend enforces it.
            // keeping it simple as per collection item 15
        });
    }

    async searchProducts(wholesalerId: number, keyword: string, page: number = 0, size: number = 10): Promise<SpringPage<Product>> {
        const res = await this.request<any>(`/products`, {
            params: {
                wholesalerId,
                search: keyword,
                page,
                size
            }
        });

        return {
            content: res.products || [],
            totalPages: res.totalPages,
            totalElements: res.totalItems,
            size: res.pageSize,
            number: res.currentPage,
            empty: !res.products || res.products.length === 0,
        };
    }

    async getProductsByCategory(wholesalerId: number, category: string, page: number = 0, size: number = 10): Promise<SpringPage<Product>> {
        const res = await this.request<any>(`/products`, {
            params: {
                wholesalerId,
                category,
                page,
                size,
            }
        });

        return {
            content: res.products || [],
            totalPages: res.totalPages,
            totalElements: res.totalItems,
            size: res.pageSize,
            number: res.currentPage,
            empty: !res.products || res.products.length === 0,
        };

    }

    async toggleProductStatus(productId: number, status: boolean): Promise<Product> {
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
