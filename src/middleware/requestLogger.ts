import { Request, Response, NextFunction } from "express";

const maskBody = (body: unknown): unknown => {
    if (body === null || body === undefined) return body;
    if (typeof body !== "object") return body;

    if (Array.isArray(body)) {
        return body.map((item) => maskBody(item));
    }

    const obj = body as Record<string, unknown>;
    const cloned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (/password|pwd|pass|password_hash/i.test(key)) {
            cloned[key] = "***"; // mask passwords
        } else if (typeof val === "object" && val !== null) {
            cloned[key] = maskBody(val);
        } else {
            cloned[key] = val;
        }
    }
    return cloned;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const { method, originalUrl } = req;

    // Log only the API (method + path) when request starts
    console.log(`[HTTP] ${new Date().toISOString()} ${method} ${originalUrl}`);

    // On finish, log only the response status code (error code if any)
    res.on("finish", () => {
        console.log(`[HTTP] ${method} ${originalUrl} -> ${res.statusCode}`);
    });

    next();
};

export default requestLogger;
