import axios from 'axios';

export const baseURL = 'https://pos-server-production-2cf1.up.railway.app/api/v1';
// export const baseURL = 'http://localhost:8080/api/v1';


const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = []; // Clear the subscribers after notifying
};

axiosInstance.interceptors.response.use(
    (response) => response, // Simply pass through the response
    async (error) => {
        const originalRequest = error.config;

        // Handle token refresh only for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite retries

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const { data } = await axiosInstance.get('/refresh');
                    isRefreshing = false;
                    onRefreshed(data.token); // Notify all subscribers
                    axiosInstance.defaults.headers['Authorization'] = `Bearer ${data.token}`; // Set new token globally
                } catch (err) {
                    isRefreshing = false;
                    return Promise.reject(err); // Reject if refresh fails
                }
            }

            // Wait for the token refresh to complete
            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    resolve(axiosInstance(originalRequest)); // Retry the original request
                });
            });
        }

        return Promise.reject(error); // Reject any other errors
    }
);

export default axiosInstance;
