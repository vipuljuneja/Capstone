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

// ============================================
// ARTICLE API
// ============================================

export const getTodayArticle = async (userId?: string) => {
  try {
    const params = userId ? { userId } : {};
    const response = await axios.get(`${API_BASE_URL}/articles/today`, { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get today\'s article:', error.response?.data || error.message);
    throw error;
  }
};

export const getLast7DaysArticles = async (userId?: string) => {
  try {
    const params = userId ? { userId } : {};
    const response = await axios.get(`${API_BASE_URL}/articles/last-7-days`, { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get last 7 days articles:', error.response?.data || error.message);
    throw error;
  }
};

export const getArticleById = async (articleId: string, userId?: string) => {
  try {
    const params = userId ? { userId } : {};
    const response = await axios.get(`${API_BASE_URL}/articles/${articleId}`, { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get article:', error.response?.data || error.message);
    throw error;
  }
};

export const generateTodayArticle = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/articles/generate`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to generate article:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// BOOKMARK API
// ============================================

export const bookmarkArticle = async (userId: string, articleId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookmarks`, {
      userId,
      articleId
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to bookmark article:', error.response?.data || error.message);
    throw error;
  }
};

export const removeBookmark = async (userId: string, articleId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/bookmarks`, {
      data: { userId, articleId }
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to remove bookmark:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserBookmarkedArticles = async (userId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookmarks/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get bookmarked articles:', error.response?.data || error.message);
    throw error;
  }
};

export const toggleBookmark = async (userId: string, articleId: string, isCurrentlyBookmarked: boolean) => {
  try {
    if (isCurrentlyBookmarked) {
      return await removeBookmark(userId, articleId);
    } else {
      return await bookmarkArticle(userId, articleId);
    }
  } catch (error: any) {
    console.error('❌ Failed to toggle bookmark:', error.response?.data || error.message);
    throw error;
  }
};