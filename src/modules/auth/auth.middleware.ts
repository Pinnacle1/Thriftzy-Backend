import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { JwtPayload, UserRole, UnauthorizedError, ForbiddenError } from "./auth.types";

/**
 * Authentication middleware - verifies JWT access token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("No token provided");
        }

        const token = authHeader.split(" ")[1];
        const payload = authService.verifyAccessToken(token);

        // Attach user info to request
        req.user = payload;
        req.userId = payload.userId;

        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const payload = authService.verifyAccessToken(token);
            req.user = payload;
            req.userId = payload.userId;
        }

        next();
    } catch (error) {
        // Silently continue without auth
        next();
    }
};

/**
 * Role-based authorization middleware
 * @param allowedRoles - Array of roles that can access the route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new UnauthorizedError("Authentication required");
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
            }

            next();
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            if (error instanceof ForbiddenError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Authorization failed"
            });
        }
    };
};

/**
 * Seller-only middleware
 */
export const sellerOnly = authorize("seller");

/**
 * Buyer-only middleware
 */
export const buyerOnly = authorize("buyer");

/**
 * Rate limiting helper - tracks requests per IP/user
 * This is a simple in-memory implementation. For production, use Redis.
 */
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const key = req.user?.userId?.toString() || req.ip || "unknown";
        const now = Date.now();

        const record = rateLimitStore.get(key);

        if (!record || now > record.resetTime) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            next();
            return;
        }

        if (record.count >= maxRequests) {
            res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
            return;
        }

        record.count++;
        next();
    };
};

/**
 * Auth-specific rate limiting for sensitive operations
 */
export const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

/**
 * Extract device info from request
 */
export const extractDeviceInfo = (req: Request): string => {
    const userAgent = req.headers["user-agent"] || "Unknown";
    return userAgent;
};

/**
 * Extract IP address from request
 */
export const extractIpAddress = (req: Request): string => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "Unknown";
};
