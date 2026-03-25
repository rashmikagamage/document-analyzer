import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  exchangeCodeForTokens,
  generateGoogleAuthUrl,
} from "../services/auth/google-oauth.service.js";
import {
  createSession,
  sessionCookie,
} from "../services/auth/session.service.js";

// Start the server-side OAuth flow. The backend owns the client secret and
// redirects the browser to Google with the configured callback URL.
export async function startGoogleAuth(

  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const state = "google-drive-auth";
    const url = generateGoogleAuthUrl(state);
    res.redirect(url);
  } catch (error) {
    next(error);
  }
}

// Set an HTTP-only session cookie so the browser can authenticate subsequent
// API calls without exposing tokens to frontend JavaScript.
export async function googleAuthCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const code = req.query.code;

    if (typeof code !== "string" || !code) {
      throw new AppError("Missing OAuth code.", {
        statusCode: 400,
        code: "MISSING_OAUTH_CODE",
        expose: true,
      });
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      throw new AppError("Google did not return an access token.", {
        statusCode: 502,
        code: "GOOGLE_TOKEN_EXCHANGE_FAILED",
        expose: false,
      });
    }

    const signedSessionId = createSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      expiryDate: tokens.expiry_date ?? null,
    });

    // For same-origin HTTPS deployment, secure + sameSite=lax supports normal app
    // navigation and OAuth redirect flows while keeping the cookie inaccessible to JS.
    res.cookie(sessionCookie.name, signedSessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 8,
    });

    // After the backend finishes the OAuth code exchange and session creation,
    // send the user back to the frontend dashboard.
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    next(error);
  }
}

export async function getSessionStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isAuthenticated = Boolean(req.session?.accessToken);

    res.status(200).json({
      authenticated: isAuthenticated,
    });
  } catch (error) {
    next(error);
  }
}