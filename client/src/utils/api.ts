// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export const api = {
  auth: {
    login: `${API_BASE_URL}/login`,
  },
  users: {
    getAll: `${API_BASE_URL}/get-all-users`,
    add: `${API_BASE_URL}/add-user`,
    edit: `${API_BASE_URL}/edit-user`,
    delete: `${API_BASE_URL}/delete-user`,
  },
  budgetEntries: {
    getAll: `${API_BASE_URL}/get-budget-entries`,
    create: `${API_BASE_URL}/post-budget-entries`,
    update: `${API_BASE_URL}/put-budget-entries`,
    delete: `${API_BASE_URL}/delete-budget-entries`,
    generateId: `${API_BASE_URL}/budget-entries/generate_id`,
  },
  collections: {
    getAll: `${API_BASE_URL}/get-collection`,
    create: `${API_BASE_URL}/insert-collection`,
    update: `${API_BASE_URL}/put-collection`,
    delete: `${API_BASE_URL}/delete-collection`,
    generateId: `${API_BASE_URL}/collection/generate_id`,
  },
  disbursements: {
    getAll: `${API_BASE_URL}/get-disbursement`,
    create: `${API_BASE_URL}/insert-disbursement`,
    update: `${API_BASE_URL}/put-disbursement`,
    delete: `${API_BASE_URL}/delete-disbursement`,
    generateId: `${API_BASE_URL}/disbursement/generate_id`,
  },
  dfurProject: {
    create: `${API_BASE_URL}/insert-dfur-project`,
    getAll: `${API_BASE_URL}/get-dfur-project`,
    update: `${API_BASE_URL}/update-dfur-project`,
    delete: `${API_BASE_URL}/delete-dfur-project`,
    generateId: `${API_BASE_URL}/dfur/generate_id`,
    getTotalData: `${API_BASE_URL}/get-total-data-dfur-project`,
  }

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
      return { error: data.error || data.message || "An error occurred" };
    }

    return { data };
  } catch (error) {
    console.error("API call failed:", error);
    return { error: "Unable to connect to the server. Please try again." };
  }
}