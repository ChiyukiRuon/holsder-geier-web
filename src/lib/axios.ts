import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:47381';
const WS_URL = `${process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:47381'}/ws`;

interface RequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

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
        (response: AxiosResponse) => {
            console.log('响应数据:', response.data.data)
            return response.data
        },
        (error) => {
            // 统一错误消息
            const message = error.response?.data?.message || error.message || '请求失败';
            return Promise.reject(message);
        }
    );

    return instance;
};

export const apiClient: AxiosInstance = createAxiosInstance();

export const get = <T = unknown>(client: AxiosInstance, url: string, options: RequestOptions = {}) =>
    client.get<T>(url, { params: options.params, headers: options.headers }).then((res: AxiosResponse<T>) => res.data);

export const post = <T = unknown>(client: AxiosInstance, url: string, data: Record<string, unknown> = {}, options: RequestOptions = {}) =>
    client.post<T>(url, data, { headers: options.headers }).then((res: AxiosResponse<T>) => res.data);

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    WS_URL,
    TIMEOUT: 10000,
} as const;
