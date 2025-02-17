import axios, { AxiosRequestConfig } from "axios";

export const TOKEN_STORAGE_KEY = "SESSION";
export const TOKEN_EXPIRY = "EXPIRY";
export const USERNAME_KEY = "curr_username";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 100000,
});

api.interceptors.request.use(
  function (config: AxiosRequestConfig): any {
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
