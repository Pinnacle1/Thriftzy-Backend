import { Request, Response } from "express";
import { userService } from "./user.service";
import {
    UpdateProfileRequest,
    UpdateEmailRequest,
    UpdatePhoneRequest,
    SendUpdateOtpRequest,
    AttachCartRequest,
    OrderFilters
} from "./user.types";
import { AuthError } from "../auth/auth.types";

export class UserController {

    /**
     * GET /users/me
     * Get current authenticated user profile
     */
    async getMe(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const profile = await userService.getMe(userId);

            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /users/:id
     * Get user by ID
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
                return;
            }

            const profile = await userService.getUserById(userId);

            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /users/me/seller-profile
     * Get current user with seller profile information
     */
    async getUserWithSellerProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const profile = await userService.getUserWithSellerProfile(userId);

            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /users/me
     * Update current user profile (name only)
     */
    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: UpdateProfileRequest = req.body;

            const profile = await userService.updateProfile(userId, data);

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: profile
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /users/me/email/send-otp
     * Send OTP to new email for verification
     */
    async sendEmailUpdateOtp(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { newEmail } = req.body;

            if (!newEmail) {
                res.status(400).json({
                    success: false,
                    message: "New email is required"
                });
                return;
            }

            const result = await userService.sendUpdateOtp(userId, "email", newEmail);

            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /users/me/email
     * Update email with OTP verification
     */
    async updateEmail(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { newEmail, otp }: UpdateEmailRequest = req.body;

            if (!newEmail || !otp) {
                res.status(400).json({
                    success: false,
                    message: "New email and OTP are required"
                });
                return;
            }

            const profile = await userService.updateEmail(userId, newEmail, otp);

            res.status(200).json({
                success: true,
                message: "Email updated successfully",
                data: profile
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /users/me/phone/send-otp
     * Send OTP to new phone for verification
     */
    async sendPhoneUpdateOtp(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { newPhone } = req.body;

            if (!newPhone) {
                res.status(400).json({
                    success: false,
                    message: "New phone number is required"
                });
                return;
            }

            const result = await userService.sendUpdateOtp(userId, "phone", newPhone);

            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /users/me/phone
     * Update phone with OTP verification
     */
    async updatePhone(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { newPhone, otp }: UpdatePhoneRequest = req.body;

            if (!newPhone || !otp) {
                res.status(400).json({
                    success: false,
                    message: "New phone number and OTP are required"
                });
                return;
            }

            const profile = await userService.updatePhone(userId, newPhone, otp);

            res.status(200).json({
                success: true,
                message: "Phone number updated successfully",
                data: profile
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /users/me/orders
     * Get current user's orders
     */
    async getUserOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;

            const filters: OrderFilters = {
                page: parseInt(req.query.page as string, 10) || 1,
                limit: parseInt(req.query.limit as string, 10) || 10,
                status: req.query.status as OrderFilters["status"]
            };

            const result = await userService.getUserOrders(userId, filters);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /users/me/cart/attach
     * Attach guest cart to current user's cart
     */
    async attachCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const { guestCartId }: AttachCartRequest = req.body;

            if (!guestCartId) {
                res.status(400).json({
                    success: false,
                    message: "Guest cart ID is required"
                });
                return;
            }

            const result = await userService.attachCart(userId, guestCartId);

            res.status(200).json(result);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("User Error:", error);

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
export const userController = new UserController();
