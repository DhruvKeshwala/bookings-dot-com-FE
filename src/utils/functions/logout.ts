import { removeStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";

export const logoutUser = () => {
  // Clear user data from localStorage
  removeStorageItem(LOCAL_KEY.USER);
  
  // Clear any other auth-related data
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Clear any other potential auth data
  sessionStorage.clear();
  
  // Force a hard refresh to clear all component states and redirect to landing page
  window.location.href = '/';
}; 