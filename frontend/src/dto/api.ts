import axios, { AxiosInstance, AxiosError } from "axios";

export const API_URL = "http://localhost:8000";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  id: number | null;
  username: string;
  access_token: string;
  refresh_token: string;
}

export interface ProfileResponse {
  message: string;
  profile: {
    id: number;
    username: string;
    status: string;
    mentor_user_id: number | null;
    join_time: string;
  };
}
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.headers._retry
    ) {
      originalRequest.headers._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const { data } = await axios.get<TokenResponse>(`${API_URL}/refresh`, {
          withCredentials: true,
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        });

        saveTokens(data.access_token, data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const AuthAPI = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>("/login", credentials);
    saveTokens(data.access_token, data.refresh_token);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/logout");
    } finally {
      clearTokens();
    }
  },

  isAuthenticated: (): boolean => {
    return !!getAccessToken();
  },

  refreshToken: async (): Promise<TokenResponse> => {
    const { data } = await apiClient.get<TokenResponse>("/refresh");
    saveTokens(data.access_token, data.refresh_token);
    return data;
  },
};

export const ProfileAPI = {
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await apiClient.get<ProfileResponse>("/profile");
    return data;
  },
};

export default apiClient;
