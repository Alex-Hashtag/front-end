// API base URLs for different environments
export const getApiBaseUrl = () => {
    return import.meta.env.PROD ? 'http://backend:8080' : 'http://localhost:8080';
};
