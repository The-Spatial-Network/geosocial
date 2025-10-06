// Utility functions for CSRF token handling

export const getCSRFToken = () => {
  // Get CSRF token from cookie (Django default)
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='));
  
  return cookieValue ? cookieValue.split('=')[1] : null;
};

// Alternative function to get CSRF token with different cookie name if needed
export const getCSRFTokenFromCookie = (cookieName = 'csrftoken') => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${cookieName}=`));
  
  return cookieValue ? cookieValue.split('=')[1] : null;
};