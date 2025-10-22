// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { BACKEND_URL } from '@env';
// const BACKEND_URL = 'http://10.128.252.6:3000';

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
  avatarImage?: string;
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
          severityLevel: 'MODERATE',
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

export const updateSeverityLevel = async (
  authUid: string,
  severityLevel: 'LOW' | 'MILD' | 'MODERATE' | 'HIGH',
): Promise<BackendUser> => {
  try {
    const { data } = await apiClient.put<ApiSuccessEnvelope<BackendUser>>(
      `/users/${authUid}/severity`,
      { severityLevel },
    );

    if (!data?.success || !data?.data) {
      throw new Error('Failed to update severity level.');
    }

    return data.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    console.error('❌ Failed to update severity level:', message);
    throw new Error(message);
  }
};

export const updateUserProfile = async (
  authUid: string,
  profileData: {
    name?: string;
    avatarImage?: string;
    profile?: {
      severityLevel?: 'LOW' | 'MILD' | 'MODERATE' | 'HIGH';
      focusHints?: string[];
    };
  },
): Promise<BackendUser> => {
  try {
    const { data } = await apiClient.put<ApiSuccessEnvelope<BackendUser>>(
      `/users/${authUid}`,
      profileData,
    );

    if (!data?.success || !data?.data) {
      throw new Error('Failed to update user profile.');
    }

    return data.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    console.error('❌ Failed to update user profile:', message);
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

// ============================================
// REFLECTION / NOTEBOOK API
// ============================================

export type Reflection = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  type: 'pipo' | 'self';
  imageName?: string; // For Pipo avatar image
  linkedSessionId?: string; // Link to PracticeSession
  scenarioId?: string; // Reference to scenario
  level?: number; // 1, 2, or 3
  createdAt: string;
  updatedAt: string;
};

export type CreateReflectionData = {
  userId: string;
  title: string;
  description?: string;
  date: string;
  type?: 'pipo' | 'self';
  imageName?: string; // For Pipo avatar image
};

export type UpdateReflectionData = {
  title?: string;
  description?: string;
  date?: string;
  type?: 'pipo' | 'self';
  imageName?: string; // For Pipo avatar image
};

/**
 * Create a new reflection entry
 */
export const createReflection = async (
  data: CreateReflectionData,
): Promise<Reflection> => {
  try {
    const response = await apiClient.post<ApiSuccessEnvelope<Reflection>>(
      '/reflections',
      data,
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to create reflection');
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to create reflection:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Get reflections for a user with optional filters
 */
export const getReflectionsByUser = async (
  userId: string,
  filters?: {
    date?: string;
    type?: 'pipo' | 'self';
    startDate?: string;
    endDate?: string;
  },
): Promise<Reflection[]> => {
  try {
    const response = await apiClient.get<ApiSuccessEnvelope<Reflection[]>>(
      `/reflections/user/${userId}`,
      { params: filters },
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to fetch reflections');
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to get reflections:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Get dates that have reflections (for calendar markers)
 */
export const getReflectionDates = async (
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    type?: 'pipo' | 'self';
  },
): Promise<Array<{ date: string; type: 'pipo' | 'self' }>> => {
  try {
    const response = await apiClient.get<
      ApiSuccessEnvelope<Array<{ date: string; type: 'pipo' | 'self' }>>
    >(`/reflections/user/${userId}/dates`, { params: filters });

    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to fetch reflection dates');
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to get reflection dates:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Get a single reflection by ID
 */
export const getReflectionById = async (
  reflectionId: string,
): Promise<Reflection> => {
  try {
    const response = await apiClient.get<ApiSuccessEnvelope<Reflection>>(
      `/reflections/${reflectionId}`,
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to fetch reflection');
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to get reflection:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Update a reflection
 */
export const updateReflection = async (
  reflectionId: string,
  data: UpdateReflectionData,
): Promise<Reflection> => {
  try {
    const response = await apiClient.put<ApiSuccessEnvelope<Reflection>>(
      `/reflections/${reflectionId}`,
      data,
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to update reflection');
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to update reflection:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Delete a reflection
 */
export const deleteReflection = async (
  reflectionId: string,
): Promise<void> => {
  try {
    const response = await apiClient.delete<
      ApiSuccessEnvelope<{ message: string }>
    >(`/reflections/${reflectionId}`);

    if (!response.data?.success) {
      throw new Error('Failed to delete reflection');
    }
  } catch (error: any) {
    console.error(
      '❌ Failed to delete reflection:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Create a Pipo note from a completed practice session
 */
export const createPipoNoteFromSession = async (
  sessionId: string,
): Promise<Reflection> => {
  try {
    const response = await apiClient.post<ApiSuccessEnvelope<Reflection>>(
      '/reflections/from-session',
      { sessionId },
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error('Failed to create Pipo note from session');
    }

    return response.data.data;
  } catch (error: any) {
    console.error(
      '❌ Failed to create Pipo note from session:',
      error.response?.data || error.message,
    );
    throw error;
  }
};
