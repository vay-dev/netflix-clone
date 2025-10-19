export interface User {
  id: number;
  username: string;
  email: string;
  roles: 'admin' | 'user';
  profile_image: string | null;
  bio?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}
