import { Request, Response } from "express";
import { authService } from "./auth.service";
import { extractDeviceInfo, extractIpAddress } from "./auth.middleware";
import {
    RegisterRequest,
    LoginRequest,
    GoogleOAuthRequest,
    ChangePasswordRequest,
    RefreshTokenRequest,
    AuthError
} from "./auth.types";

export class AuthController {

    /**
     * POST /auth/register
     * Register a new user
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const data: RegisterRequest = req.body;
            const result = await authService.register(data);
            res.status(201).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /auth/login
     * Login with email/phone and password
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const data: LoginRequest = req.body;
            const deviceInfo = extractDeviceInfo(req);
            const ipAddress = extractIpAddress(req);

            const result = await authService.login(data, deviceInfo, ipAddress);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /auth/google
     * Login/Register with Google OAuth
     */
    async googleOAuth(req: Request, res: Response): Promise<void> {
        try {
            const data: GoogleOAuthRequest = req.body;
            const deviceInfo = extractDeviceInfo(req);
            const ipAddress = extractIpAddress(req);

            const result = await authService.googleOAuth(data, deviceInfo, ipAddress);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /auth/change-password
     * Change password (authenticated)
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: ChangePasswordRequest = req.body;
            const result = await authService.changePassword(userId, data);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /auth/refresh
     * Refresh access token
     */
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const data: RefreshTokenRequest = req.body;
            const deviceInfo = extractDeviceInfo(req);
            const ipAddress = extractIpAddress(req);

            const result = await authService.refreshTokens(data, deviceInfo, ipAddress);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /auth/logout
     * Logout current session
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const result = await authService.logout(refreshToken);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /auth/logout-all
     * Logout from all devices (authenticated)
     */
    async logoutAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const result = await authService.logoutAllDevices(userId);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const user = await authService.getCurrentUser(userId);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Auth Error:", error);

        if (error instanceof AuthError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

// Export singleton instance
export const authController = new AuthController();
