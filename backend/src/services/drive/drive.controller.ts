import type { NextFunction, Request, Response } from "express";
import { listRecentPdfFiles } from "./drive.service.js";

export async function listDriveFiles(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const accessToken = req.session?.accessToken;

        if (!accessToken) {
            return res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                    requestId: req.requestId,
                },
            });
        }

        const files = await listRecentPdfFiles(accessToken);

        res.status(200).json({ files });
    } catch (error) {
        next(error);
    }
}