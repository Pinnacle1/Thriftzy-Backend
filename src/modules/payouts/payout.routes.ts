import { Router, Request, Response } from "express";
import { payoutController } from "./payout.controller";
import { authenticate, sellerOnly } from "../auth";

const router = Router();

// ============== ALL ROUTES REQUIRE SELLER AUTHENTICATION ==============

router.use(authenticate, sellerOnly);

/**
 * @route   GET /payouts/earnings
 * @desc    Get seller's total earnings summary
 * @access  Private (Seller only)
 */
router.get("/earnings", (req: Request, res: Response) =>
    payoutController.getSellerEarnings(req, res)
);

/**
 * @route   GET /payouts/earnings/by-store
 * @desc    Get earnings breakdown by store
 * @access  Private (Seller only)
 */
router.get("/earnings/by-store", (req: Request, res: Response) =>
    payoutController.getEarningsByStore(req, res)
);

/**
 * @route   GET /payouts
 * @desc    Get all payout requests for the seller
 * @access  Private (Seller only)
 * @query   status (pending|requested|approved|completed|rejected)
 */
router.get("/", (req: Request, res: Response) =>
    payoutController.getSellerPayouts(req, res)
);

/**
 * @route   GET /payouts/:id
 * @desc    Get specific payout by ID
 * @access  Private (Seller only)
 */
router.get("/:id", (req: Request, res: Response) =>
    payoutController.getPayoutById(req, res)
);

/**
 * @route   POST /payouts/request
 * @desc    Create a new payout request
 * @access  Private (Seller only)
 * @body    { store_id?, order_ids?, request_notes? }
 */
router.post("/request", (req: Request, res: Response) =>
    payoutController.createPayoutRequest(req, res)
);

export { router as payoutRoutes };
