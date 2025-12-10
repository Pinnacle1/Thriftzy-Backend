import { Router, Request, Response } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

// ============== ALL ROUTES REQUIRE AUTHENTICATION ==============

/**
 * @route   GET /users/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get("/me", authenticate, (req: Request, res: Response) =>
    userController.getMe(req, res)
);

/**
 * @route   PATCH /users/me
 * @desc    Update current user profile (name)
 * @access  Private
 * @body    { name?: string }
 */
router.patch("/me", authenticate, (req: Request, res: Response) =>
    userController.updateProfile(req, res)
);

/**
 * @route   GET /users/me/seller-profile
 * @desc    Get current user with seller profile, stores and documents
 * @access  Private
 */
router.get("/me/seller-profile", authenticate, (req: Request, res: Response) =>
    userController.getUserWithSellerProfile(req, res)
);

/**
 * @route   POST /users/me/email/send-otp
 * @desc    Send OTP to new email for verification
 * @access  Private
 * @body    { newEmail: string }
 */
router.post("/me/email/send-otp", authenticate, (req: Request, res: Response) =>
    userController.sendEmailUpdateOtp(req, res)
);

/**
 * @route   POST /users/me/email
 * @desc    Update email with OTP verification
 * @access  Private
 * @body    { newEmail: string, otp: string }
 */
router.post("/me/email", authenticate, (req: Request, res: Response) =>
    userController.updateEmail(req, res)
);

/**
 * @route   POST /users/me/phone/send-otp
 * @desc    Send OTP to new phone for verification
 * @access  Private
 * @body    { newPhone: string }
 */
router.post("/me/phone/send-otp", authenticate, (req: Request, res: Response) =>
    userController.sendPhoneUpdateOtp(req, res)
);

/**
 * @route   POST /users/me/phone
 * @desc    Update phone with OTP verification
 * @access  Private
 * @body    { newPhone: string, otp: string }
 */
router.post("/me/phone", authenticate, (req: Request, res: Response) =>
    userController.updatePhone(req, res)
);

/**
 * @route   GET /users/me/orders
 * @desc    Get current user's orders
 * @access  Private
 * @query   page, limit, status
 */
router.get("/me/orders", authenticate, (req: Request, res: Response) =>
    userController.getUserOrders(req, res)
);

/**
 * @route   POST /users/me/cart/attach
 * @desc    Attach guest cart to user's cart (merge carts)
 * @access  Private
 * @body    { guestCartId: number }
 */
router.post("/me/cart/attach", authenticate, (req: Request, res: Response) =>
    userController.attachCart(req, res)
);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID (public profile)
 * @access  Private
 */
router.get("/:id", authenticate, (req: Request, res: Response) =>
    userController.getUserById(req, res)
);

export { router as userRoutes };
