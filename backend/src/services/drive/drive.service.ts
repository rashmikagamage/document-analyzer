import { google } from "googleapis";
import type { drive_v3 } from "googleapis";

export type DriveFileDto = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
};

function createDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.drive({
    version: "v3",
    auth,
  });
}

function mapDriveFile(file: drive_v3.Schema$File): DriveFileDto {
  return {
    id: file.id ?? "",
    name: file.name ?? "Untitled",
    mimeType: file.mimeType ?? "application/octet-stream",
    modifiedTime: file.modifiedTime ?? undefined,
    size: file.size ?? undefined,
    webViewLink: file.webViewLink ?? undefined,
  };
}

export async function listRecentPdfFiles(accessToken: string): Promise<DriveFileDto[]> {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.list({
    pageSize: 10,
    orderBy: "modifiedTime desc",
    q: "mimeType='application/pdf' and trashed=false",
    fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
  });

  const files = response.data.files ?? [];

  return files
    .filter((file) => Boolean(file.id))
    .map(mapDriveFile);
}

export async function downloadPdfFile(
  accessToken: string,
  fileId: string
): Promise<Buffer> {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    {
      responseType: "arraybuffer",
    }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function getDriveFileMetadata(
  accessToken: string,
  fileId: string
): Promise<DriveFileDto> {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,modifiedTime,size,webViewLink",
  });

  const file = response.data;

  return {
    id: file.id ?? "",
    name: file.name ?? "Untitled",
    mimeType: file.mimeType ?? "application/octet-stream",
    modifiedTime: file.modifiedTime ?? undefined,
    size: file.size ?? undefined,
    webViewLink: file.webViewLink ?? undefined,
  };
}