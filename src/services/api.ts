// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

export const createUserInBackend = async (userData: {
  authUid: string;
  email: string;
  name: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, {
      authUid: userData.authUid,
      email: userData.email,
      name: userData.name,
      profile: {
        severityLevel: 'Moderate',
        focusHints: [],
      },
    });

    console.log('✅ User created in MongoDB:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to create user in backend:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserByAuthUid = async (authUid: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${authUid}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get user:', error.response?.data || error.message);
    throw error;
  }
};