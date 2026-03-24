import { apiFetch } from "./client";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
};

export type ListFilesResponse = {
  files: DriveFile[];
};

export function getDriveFiles() {
  return apiFetch<ListFilesResponse>("/api/drive/files");
}