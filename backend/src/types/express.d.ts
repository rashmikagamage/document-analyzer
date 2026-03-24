import "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      session?: {
        accessToken: string;
        refreshToken?: string;
        expiryDate?: number | null;
      };
    }
  }
}

export {};