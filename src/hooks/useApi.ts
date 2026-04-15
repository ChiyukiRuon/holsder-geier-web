import { useState, useCallback } from 'react';

/**
 * API 请求状态的通用 Hook
 */
export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * API 请求的通用 Hook
 * @param apiFunc API 函数
 * @returns 状态和执行方法
 */
export function useApi<T extends (...args: never[]) => Promise<unknown>>(
    apiFunc: T
) {
    const [state, setState] = useState<UseApiState<ReturnType<T>>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: Parameters<T>) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const result = await apiFunc(...args);
                setState({ data: result as ReturnType<T>, loading: false, error: null });
                return result;
            } catch (error) {
                const message = error instanceof Error ? error.message : '请求失败';
                setState({ data: null, loading: false, error: message });
                throw error;
            }
        },
        [apiFunc]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

/**
 * 简化版 useApi，自动调用
 */
export function useApiCall<T>(
    apiFunc: () => Promise<T>,
    deps: React.DependencyList = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiFunc();
            setData(result);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : '请求失败';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, execute };
}
