import { google } from "googleapis";
import { env } from "../../config/env.js";

const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

// Centralize Google OAuth client configuration so the same redirect URI and
// credentials are used for both the authorization step and token exchange.
export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

// Generate the Google consent URL. The redirect URI must exactly match the
// value registered in Google Cloud Console or the flow will fail.
export function generateGoogleAuthUrl(state: string) {
  const oauth2Client = createGoogleOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_READONLY_SCOPE],
    state,
  });
}

// Exchange the authorization code returned by Google for access/refresh tokens.
// This must happen on the backend because it uses the OAuth client secret.
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createGoogleOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}