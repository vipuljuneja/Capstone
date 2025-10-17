// src/services/api.ts
import axios, { AxiosError } from 'axios';
// import { BACKEND_URL } from '@env';
const BACKEND_URL = 'http://10.128.252.6:3000';

const API_BASE_URL = __DEV__
  ? `${BACKEND_URL}/api`
  : 'https://your-production-api.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

type ApiSuccessEnvelope<T> = {
  success: boolean;
  data: T;
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Unexpected error. Please try again.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error. Please try again.';
};

export type BackendUser = {
  _id: string;
  authUid: string;
  email: string;
  name: string;
  profile?: {
    severityLevel?: string;
    focusHints?: string[];
  };
  [key: string]: unknown;
};

export const createUserInBackend = async (userData: {
  authUid: string;
  email: string;
  name: string;
}): Promise<BackendUser> => {
  try {
    const { data } = await apiClient.post<ApiSuccessEnvelope<BackendUser>>(
      '/users',
      {
        authUid: userData.authUid,
        email: userData.email,
        name: userData.name,
        profile: {
          severityLevel: 'Moderate',
          focusHints: [],
        },
      },
    );

    if (!data?.success || !data?.data) {
      throw new Error('Failed to create user profile.');
    }

    return data.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    console.error('❌ Failed to create user in backend:', message);
    throw new Error(message);
  }
};

export const getUserByAuthUid = async (
  authUid: string,
): Promise<BackendUser> => {
  try {
    const { data } = await apiClient.get<ApiSuccessEnvelope<BackendUser>>(
      `/users/${authUid}`,
    );

    if (!data?.success || !data?.data) {
      throw new Error('Failed to load user profile.');
    }

    return data.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    console.error('❌ Failed to get user:', message);
    throw new Error(message);
  }
};

// ============================================
// ARTICLE API
// ============================================

export const getTodayArticle = async (userId?: string) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get('/articles/today', { params });
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Failed to get today's article:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getLast7DaysArticles = async (userId?: string) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get('/articles/last-7-days', { params });
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to get last 7 days articles:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getArticleById = async (articleId: string, userId?: string) => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get(`/articles/${articleId}`, { params });
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to get article:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const generateTodayArticle = async () => {
  try {
    const response = await apiClient.post('/articles/generate');
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to generate article:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

// ============================================
// BOOKMARK API
// ============================================

export const bookmarkArticle = async (userId: string, articleId: string) => {
  try {
    const response = await apiClient.post('/bookmarks', {
      userId,
      articleId,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to bookmark article:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const removeBookmark = async (userId: string, articleId: string) => {
  try {
    const response = await apiClient.delete('/bookmarks', {
      data: { userId, articleId },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to remove bookmark:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getUserBookmarkedArticles = async (userId: string) => {
  try {
    const response = await apiClient.get(`/bookmarks/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to get bookmarked articles:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const toggleBookmark = async (
  userId: string,
  articleId: string,
  isCurrentlyBookmarked: boolean,
) => {
  try {
    if (isCurrentlyBookmarked) {
      return await removeBookmark(userId, articleId);
    } else {
      return await bookmarkArticle(userId, articleId);
    }
  } catch (error: any) {
    console.error(
      '❌ Failed to toggle bookmark:',
      error.response?.data || error.message,
    );
    throw error;
  }
};
