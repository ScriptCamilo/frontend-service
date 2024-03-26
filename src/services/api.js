import axios from "axios";
import { getBackendUrlV1 } from "../config";

const api = axios.create({
  baseURL: getBackendUrlV1(),
  withCredentials: true,
});

export default api;
