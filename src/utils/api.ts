/**
 * Utility functions for making API requests
 * Uses the API base URL defined in Vite configuration
 */

// TypeScript declaration for the global variable defined in vite.config.ts
declare const __API_BASE_URL__: string;

// Get the base URL from the environment
const apiBaseUrl = __API_BASE_URL__ || '';

/**
 * Makes a fetch request to the API with the correct base URL
 * @param endpoint - API endpoint path (should start with '/')
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // If endpoint already starts with http/https, use it directly
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${apiBaseUrl}${endpoint}`;
    
  return fetch(url, options);
}

/**
 * GET request helper
 */
export async function apiGet(endpoint: string, options: RequestInit = {}) {
  return apiRequest(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint: string, data: any, options: RequestInit = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint: string, data: any, options: RequestInit = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint: string, options: RequestInit = {}) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
}
