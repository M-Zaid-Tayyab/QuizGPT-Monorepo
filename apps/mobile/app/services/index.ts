import axios from "axios";
import { useUserStore } from "../modules/auth/store/userStore";

const isLocal = __DEV__;
const isDev = __DEV__;
const ROOT_URL = isLocal
  ? "https://c3f7689ca6c3.ngrok-free.app"
  : isDev
  ? "https://quizgpt-backend-development.up.railway.app"
  : "https://quizgpt-backend-production.up.railway.app";
const BASE_URL = `${ROOT_URL}/api/`;

const createClient = (isFormData = false) => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 100000,
    headers: {
      Accept: "application/json",
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  });

  client.interceptors.request.use(
    async (config) => {
      const requestConfig = config;
      const token = useUserStore.getState().user?.token;
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      console.log(
        "API Config =>",
        `${config?.baseURL}${config.url}`,
        config?.params
          ? JSON.stringify(config?.params)
          : JSON.stringify(config?.data)
      );

      return requestConfig;
    },
    (err) => {
      console.error(
        "Request Error =>",
        err.response ? err.response.data : err.message
      );
      return Promise.reject(err);
    }
  );

  return client;
};

const client = createClient(false);
const formDataClient = createClient(true);

export { BASE_URL, client, createClient, formDataClient, ROOT_URL };
