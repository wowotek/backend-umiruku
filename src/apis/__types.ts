export interface TReturn<T>{
    status: string;
    result: T | null | string | Error
};