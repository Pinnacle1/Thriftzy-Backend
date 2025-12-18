/**
 * Verification Routes
 * 
 * Routes for testing and handling OTP verification
 */

import { Router, Request, Response } from "express";
import { otpService } from "./otp.service";

const router = Router();

/**
 * @route   POST /verify/send-email-otp
 * @desc    Send OTP to email for testing
 * @access  Public
 * @body    { email: string, name?: string }
 */
router.post("/send-email-otp", async (req: Request, res: Response) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email is required"
            });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
            return;
        }

        const result = await otpService.sendEmailOTP(email, name);

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("Send email OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });
    }
});

/**
 * @route   POST /verify/send-phone-otp
 * @desc    Send OTP to phone for testing
 * @access  Public
 * @body    { phone: string }
 */
router.post("/send-phone-otp", async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
            return;
        }

        // Basic phone validation (10 digits for Indian numbers)
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\D/g, "").slice(-10);

        if (!phoneRegex.test(cleanPhone)) {
            res.status(400).json({
                success: false,
                message: "Invalid phone number. Please enter a valid 10-digit Indian mobile number."
            });
            return;
        }

        const result = await otpService.sendPhoneOTP(phone);

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("Send phone OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });
    }
});

/**
 * @route   POST /verify/verify-otp
 * @desc    Verify OTP
 * @access  Public
 * @body    { identifier: string, otp: string }
 *          identifier can be email or phone
 */
router.post("/verify-otp", async (req: Request, res: Response) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            res.status(400).json({
                success: false,
                message: "Identifier (email/phone) and OTP are required"
            });
            return;
        }

        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            res.status(400).json({
                success: false,
                message: "OTP must be a 6-digit number"
            });
            return;
        }

        const result = otpService.verifyOTP(identifier, otp);

        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
});

export { router as verificationRoutes };
