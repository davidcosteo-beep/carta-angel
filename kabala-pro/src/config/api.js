import { getServerConfig } from "../utils/serverConfig";

export const getApiUrl = () =>
  getServerConfig().apiUrl;

export const API_URL = getApiUrl();
