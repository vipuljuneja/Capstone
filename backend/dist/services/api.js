"use strict";
// Note: This file appears to be client-side code. For backend, use Firebase Admin SDK instead.
// Keeping this for potential client-side usage, but token should be passed as parameter.
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAPI = void 0;
const API_BASE_URL = process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000/api/v1'
    : 'https://your-production-api.com/api/v1';
/**
 * Get Firebase ID token for authenticated requests
 * Note: In backend context, token should be passed from request, not retrieved from auth.currentUser
 */
const getAuthToken = async (token) => {
    // In backend, token should be passed as parameter from the request
    return token || null;
};
/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}, token) => {
    const authToken = await getAuthToken(token);
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
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
exports.userAPI = {
    /**
     * Register user after Firebase signup
     */
    register: async (name, email) => {
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
    updateProfile: async (data) => {
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
    getUserById: async (userId) => {
        return apiRequest(`/users/${userId}`, {
            method: 'GET',
        });
    },
};
exports.default = apiRequest;
//# sourceMappingURL=api.js.map