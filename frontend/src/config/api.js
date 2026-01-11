const getBaseUrl = () => {
  // Explicit env override (recommended)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }

  // Local development
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  // Production BACKEND URL (NOT frontend)
  return "https://instagram-clone-lb97i4je3-gitrizwan-webs-projects.vercel.app";
};

export const API_BASE_URL = getBaseUrl();

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
