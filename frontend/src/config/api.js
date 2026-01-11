// API Configuration
// Uses environment variable in production, localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:3000" : "https://instagram-clone-lb97i4je3-gitrizwan-webs-projects.vercel.app");

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.DEV ? "http://localhost:3000" : "https://instagram-clone-lb97i4je3-gitrizwan-webs-projects.vercel.app");

// Helper function to create full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

