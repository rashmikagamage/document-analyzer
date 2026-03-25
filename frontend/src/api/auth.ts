import { apiFetch } from "./client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function getGoogleAuthUrl() {
  return `${API_BASE_URL}/api/auth/google`;
}

export type SessionStatusResponse = {
  authenticated: boolean;
};

export function getSessionStatus() {
  return apiFetch<SessionStatusResponse>("/api/auth/session");
}