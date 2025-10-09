import { auth } from '../firebase';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1' 
  : 'https://your-production-api.com/api/v1';

/**
 * Get Firebase ID token for authenticated requests
 */
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Make authenticated API request
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

/**
 * User API endpoints
 */
export const userAPI = {
  /**
   * Register user after Firebase signup
   */
  register: async (name: string, email: string) => {
    return apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return apiRequest('/users/me', {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    name?: string;
    profile?: {
      severityLevel?: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
      focusHints?: string[];
    };
  }) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user streak (after completing a practice session)
   */
  updateStreak: async () => {
    return apiRequest('/users/streak', {
      method: 'PUT',
    });
  },

  /**
   * Get user by ID (for community features)
   */
  getUserById: async (userId: string) => {
    return apiRequest(`/users/${userId}`, {
      method: 'GET',
    });
  },
};

export default apiRequest;