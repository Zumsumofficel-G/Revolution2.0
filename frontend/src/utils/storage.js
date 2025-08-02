// LocalStorage utilities for persisting data
import { users } from '../data/users';
import { applicationForms } from '../data/applications';
import { applicationSubmissions } from '../data/submissions';
import { changelogs } from '../data/changelogs';

const STORAGE_KEYS = {
  USERS: 'revolution_rp_users',
  APPLICATIONS: 'revolution_rp_applications', 
  SUBMISSIONS: 'revolution_rp_submissions',
  CHANGELOGS: 'revolution_rp_changelogs',
  AUTH_TOKEN: 'revolution_rp_auth_token',
  AUTH_USER: 'revolution_rp_auth_user'
};

// Initialize localStorage with default data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applicationForms));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(applicationSubmissions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHANGELOGS)) {
    localStorage.setItem(STORAGE_KEYS.CHANGELOGS, JSON.stringify(changelogs));
  }
};

// Generic storage functions
export const getStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
};

export const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key ${key}:`, error);
    return false;
  }
};

// Specific data functions
export const getUsers = () => getStorageData(STORAGE_KEYS.USERS);
export const setUsers = (data) => setStorageData(STORAGE_KEYS.USERS, data);

export const getApplications = () => getStorageData(STORAGE_KEYS.APPLICATIONS);
export const setApplications = (data) => setStorageData(STORAGE_KEYS.APPLICATIONS, data);

export const getSubmissions = () => getStorageData(STORAGE_KEYS.SUBMISSIONS);
export const setSubmissions = (data) => setStorageData(STORAGE_KEYS.SUBMISSIONS, data);

export const getChangelogs = () => getStorageData(STORAGE_KEYS.CHANGELOGS);
export const setChangelogs = (data) => setStorageData(STORAGE_KEYS.CHANGELOGS, data);

// Auth functions
export const getAuthToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
export const setAuthToken = (token) => localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
export const removeAuthToken = () => localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

export const getAuthUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  return data ? JSON.parse(data) : null;
};
export const setAuthUser = (user) => localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
export const removeAuthUser = () => localStorage.removeItem(STORAGE_KEYS.AUTH_USER);

// Clear all data (for reset/development)
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export { STORAGE_KEYS };