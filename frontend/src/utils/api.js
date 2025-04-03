import axios from "axios";

// Use API URL instead of frontend URL
const apiUrl = process.env.REACT_APP_API_URL;

console.log("API URL:", apiUrl);

const api = axios.create({
  baseURL: apiUrl, // Set API base URL
});

// Request interceptor to log outgoing requests
api.interceptors.request.use((request) => {
  console.log("Starting Request:", request);
  return request;
});

// Response interceptor to log incoming responses
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("Error Response:", error);
    return Promise.reject(error);
  }
);

export default api;