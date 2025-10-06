import axios from 'axios';
import apiClient from './client';

// Auth API using dj-rest-auth for clean REST authentication
export const authAPI = {
  // Login using dj-rest-auth
  login: async (credentials) => {
    const response = await apiClient.post('auth/login/', {
      username: credentials.username,
      password: credentials.password,
    });
    return response.data;
  },
  
  // Signup using dj-rest-auth
  signup: async (userData) => {
    const response = await apiClient.post('auth/registration/', {
      username: userData.username,
      email: userData.email,
      password1: userData.password1,
      password2: userData.password2,
    });
    return response.data;
  },
  
  // Get current user from dj-rest-auth
  getCurrentUser: async () => {
    const response = await apiClient.get('auth/user/');
    return response.data;
  },
  
  // Logout using dj-rest-auth
  logout: async () => {
    const response = await apiClient.post('auth/logout/');
    return response.data;
  },
  
  // Password change
  changePassword: async (passwords) => {
    const response = await apiClient.post('auth/password/change/', passwords);
    return response.data;
  },
  
  // Password reset
  resetPassword: async (email) => {
    const response = await apiClient.post('auth/password/reset/', { email });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (username) => {
    const response = await apiClient.get(`users/${username}/`);
    return response.data;
  },
  
  updateProfile: async (username, userData) => {
    const response = await apiClient.patch(`users/${username}/`, userData);
    return response.data;
  },
};

// Maps API
export const mapsAPI = {
  getAllMaps: async () => {
    const response = await apiClient.get('maps/');
    return response.data;
  },
  
  getMyMaps: async () => {
    const response = await apiClient.get('maps/my_maps/');
    return response.data;
  },
  
  getPublicMaps: async () => {
    const response = await apiClient.get('maps/public_maps/');
    return response.data;
  },
  
  getMap: async (slug) => {
    const response = await apiClient.get(`maps/${slug}/`);
    return response.data;
  },
  
  createMap: async (mapData) => {
    const response = await apiClient.post('maps/', mapData);
    return response.data;
  },
  
  updateMap: async (slug, mapData) => {
    const response = await apiClient.patch(`maps/${slug}/`, mapData);
    return response.data;
  },
  
  deleteMap: async (slug) => {
    await apiClient.delete(`maps/${slug}/`);
  },
};

// Pins API
export const pinsAPI = {
  getPinsByMap: async (mapSlug) => {
    const response = await apiClient.get(`pins/by_map/?map_slug=${mapSlug}`);
    return response.data;
  },
  
  createPin: async (pinData) => {
    const response = await apiClient.post('pins/', pinData);
    return response.data;
  },
  
  updatePin: async (pinId, pinData) => {
    const response = await apiClient.patch(`pins/${pinId}/`, pinData);
    return response.data;
  },
  
  deletePin: async (pinId) => {
    await apiClient.delete(`pins/${pinId}/`);
  },
};

// Collaborators API
export const collaboratorsAPI = {
  getCollaborators: async (mapId) => {
    const response = await apiClient.get(`collaborators/?map=${mapId}`);
    return response.data;
  },
  
  addCollaborator: async (collaboratorData) => {
    const response = await apiClient.post('collaborators/', collaboratorData);
    return response.data;
  },
  
  removeCollaborator: async (collaboratorId) => {
    await apiClient.delete(`collaborators/${collaboratorId}/`);
  },
};

// Choices API
export const choicesAPI = {
  getMapStyles: async () => {
    const response = await apiClient.get('choices/map_styles/');
    return response.data;
  },
  
  getContentTypes: async () => {
    const response = await apiClient.get('choices/content_types/');
    return response.data;
  },
  
  getIcons: async () => {
    const response = await apiClient.get('choices/icons/');
    return response.data;
  },
};