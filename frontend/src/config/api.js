const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    return url.startsWith("http://") && !url.includes("localhost")
      ? url.replace("http://", "https://")
      : url;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  return "https://instagram-clone-mauve-iota.vercel.app";
};

export const API_BASE_URL = getBaseUrl();

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://instagram-clone-mauve-iota.vercel.app");

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
