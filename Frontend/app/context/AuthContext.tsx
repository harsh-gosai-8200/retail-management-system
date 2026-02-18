import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
    api,
    type LoginRequest,
    type LoginResponse,
    type RegisterRequest,
} from "~/services/api";
import { useNavigate, useLocation } from "react-router";

interface AuthContextType {
    user: { id: number; username: string; role: string } | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
         if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("jwt_token");
    const storedRole = localStorage.getItem("user_role");
    const storedUserId = localStorage.getItem("user_id");
    const storedUsername = localStorage.getItem("username");

    if (storedToken && storedRole && storedUserId && storedUsername) {
      setToken(storedToken);
      setUser({
        role: storedRole,
        id: parseInt(storedUserId),
        username: storedUsername
      });
    }
    setIsLoading(false);
  }
        // const storedToken = localStorage.getItem("jwt_token");
        // const storedRole = localStorage.getItem("user_role");
        // const storedUserId = localStorage.getItem("user_id");
        // const storedUsername = localStorage.getItem("username");

        // if (storedToken && storedRole && storedUserId && storedUsername) {
        //     setToken(storedToken);
        //     setUser({
        //         role: storedRole,
        //         id: parseInt(storedUserId),
        //         username: storedUsername
        //     });
        // }
        // setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await api.login(credentials);
            localStorage.setItem("jwt_token", response.token);
            localStorage.setItem("user_role", response.role);
            localStorage.setItem("user_id", response.userId.toString());
            localStorage.setItem("username", response.username);
            setToken(response.token);
            setUser({
                role: response.role,
                id: response.userId,
                username: response.username
            });
            navigate("/wholesaler"); // Redirect to dashboard after login
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            await api.register(data);
            // Optional: Auto-login after register or redirect to login
            navigate("/auth/login");
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        setToken(null);
        setUser(null);
        navigate("/auth/login");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
