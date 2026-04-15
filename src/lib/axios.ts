import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = '/api';
const WS_URL = '/ws';

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // 请求拦截器
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 响应拦截器
    instance.interceptors.response.use(
        (response: AxiosResponse) => response.data,
        (error) => {
            // 统一错误消息
            const message = error.response?.data?.message || error.message || '请求失败';
            return Promise.reject(message);
        }
    );

    return instance;
};

export const apiClient: AxiosInstance = createAxiosInstance();

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    WS_URL,
    TIMEOUT: 10000,
} as const;
