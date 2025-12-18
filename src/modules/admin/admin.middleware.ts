import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";
import { AdminUnauthorizedError, AdminForbiddenError } from "./admin.types";

// ADMIN AUTHENTICATION MIDDLEWARE

export const adminAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AdminUnauthorizedError("Admin token required");
        }

        const token = authHeader.split(" ")[1];
        const payload = adminService.verifyAccessToken(token);

        // Attach admin info to request
        req.admin = payload;
        req.adminId = payload.adminId;

        next();
    } catch (error) {
        if (error instanceof AdminUnauthorizedError) {
            res.status(401).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(401).json({
            success: false,
            message: "Admin authentication failed"
        });
    }
};

// SUPER ADMIN AUTHORIZATION MIDDLEWARE


export const superAdminOnly = (req: Request, res: Response, next: NextFunction): void => {
    try {
        if (!req.admin) {
            throw new AdminUnauthorizedError("Admin authentication required");
        }

        if (req.admin.role !== "super_admin") {
            throw new AdminForbiddenError("Super admin access required");
        }

        next();
    } catch (error) {
        if (error instanceof AdminForbiddenError) {
            res.status(403).json({
                success: false,
                message: error.message
            });
            return;
        }

        if (error instanceof AdminUnauthorizedError) {
            res.status(401).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};
