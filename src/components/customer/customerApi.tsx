import axios from "axios";

export const API_URL = "http://localhost:5000/api/users";

export interface User {
  userId?: number;
  username: string;
  phonenumber: string;
  email: string;
  password?: string;
}

// Fetch all users
export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Fetch user by ID
export const getUserById = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (userData: User) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Update user
export const updateUser = async (id: number, userData: Partial<User>) => {
  const response = await axios.put(`${API_URL}/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
