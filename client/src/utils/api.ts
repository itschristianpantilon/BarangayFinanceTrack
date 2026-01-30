// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export const api = {
  auth: {
    login: `${API_BASE_URL}/login`,
  },
};

// Generic API call function with error handling
export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "An error occurred" };
    }

    return { data };
  } catch (error) {
    console.error("API call failed:", error);
    return { error: "Unable to connect to the server. Please try again." };
  }
}