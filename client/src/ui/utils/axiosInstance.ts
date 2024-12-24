// import axios from 'axios';

// export const baseURL = 'http://localhost:8080/api/v1/' 

// const axiosInstance = axios.create({
//     baseURL,
//     withCredentials: true,
// });


// export default axiosInstance;

// src/utils/axiosInstance.ts
import axios from 'axios';

export const baseURL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

// Token refresh mechanism
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRrefreshed = (token: string) => {
    refreshSubscribers.map((callback) => callback(token));
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const { data } = await axiosInstance.get('/refresh');
                    isRefreshing = false;
                    onRrefreshed(data.token);
                } catch (err) {
                    isRefreshing = false;
                    return Promise.reject(err);
                }
            }

            // Wait for token refresh and retry original request
            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    resolve(axiosInstance(originalRequest));
                });
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
