import type { AxiosInstance } from "axios";

let axiosClient: AxiosInstance | null = null;

export function setAxiosClient(client: AxiosInstance) {
    axiosClient = client;
}

export function getAxiosClient(): AxiosInstance {
    if (!axiosClient) {
        throw new Error("Axios client not initialized yet");
    }
    return axiosClient;
}