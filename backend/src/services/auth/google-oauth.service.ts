import { google } from "googleapis";
import { env } from "../../config/env.js";

const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export function generateGoogleAuthUrl(state: string) {
  const oauth2Client = createGoogleOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_READONLY_SCOPE],
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createGoogleOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}