export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface AuthUser {
  username: string;
  token: string;
  isAuthenticated: boolean;
}