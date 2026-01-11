// API Configuration
// Uses environment variable in production, localhost in development
// Always use HTTPS in production for security
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    // Ensure HTTPS if custom URL is provided
    const url = import.meta.env.VITE_API_URL;
    return url.startsWith("http://") && !url.includes("localhost") 
      ? url.replace("http://", "https://") 
      : url;
  }
  
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }
  
  // Production: always use HTTPS
  return "https://instagram-clone-lb97i4je3-gitrizwan-webs-projects.vercel.app";
};

export const API_BASE_URL = getBaseUrl();

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.DEV ? "http://localhost:3000" : "https://instagram-clone-lb97i4je3-gitrizwan-webs-projects.vercel.app");

// Helper function to create full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

