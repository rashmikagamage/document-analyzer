import {apiFetch} from "./client";

export type HealthResponse = {
    status: string;
};

export function getHealth(){
    return apiFetch<HealthResponse>("/api/health");
}