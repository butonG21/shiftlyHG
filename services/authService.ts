import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api'; // Ganti jika backend sudah di-deploy

export const loginUser = async (username: string, password: string) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    username,
    password,
  });

  return response.data; // → { token, user }
};
