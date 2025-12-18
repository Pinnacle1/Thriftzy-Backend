import { Router, Request, Response } from "express";
import { supportController } from "./support.controller";
import { authenticate, optionalAuth } from "../auth";
import { adminAuthenticate } from "../admin";

const router = Router();


/**
 * @route   POST /support/tickets
 * @desc    Create a new support ticket (can be anonymous)
 * @access  Public (optional authentication)
 * @body    { name, email, phone?, subject, message, category? }
 */
router.post("/tickets", optionalAuth, (req: Request, res: Response) =>
    supportController.createTicket(req, res)
);


/**
 * @route   GET /support/tickets/my
 * @desc    Get tickets created by the authenticated user
 * @access  Private (requires authentication)
 */
router.get("/tickets/my", authenticate, (req: Request, res: Response) =>
    supportController.getMyTickets(req, res)
);


/**
 * @route   GET /support/tickets
 * @desc    Get all support tickets with optional filtering
 * @access  Admin only
 * @query   status, priority, category, page, limit
 */
router.get("/tickets", adminAuthenticate, (req: Request, res: Response) =>
    supportController.getTickets(req, res)
);

/**
 * @route   GET /support/statistics
 * @desc    Get support ticket statistics
 * @access  Admin only
 */
router.get("/statistics", adminAuthenticate, (req: Request, res: Response) =>
    supportController.getStatistics(req, res)
);

/**
 * @route   GET /support/tickets/:id
 * @desc    Get a specific support ticket by ID
 * @access  Admin only
 */
router.get("/tickets/:id", adminAuthenticate, (req: Request, res: Response) =>
    supportController.getTicketById(req, res)
);

/**
 * @route   PATCH /support/tickets/:id
 * @desc    Update a support ticket (status, priority, admin response)
 * @access  Admin only
 * @body    { status?, priority?, admin_response? }
 */
router.patch("/tickets/:id", adminAuthenticate, (req: Request, res: Response) =>
    supportController.updateTicket(req, res)
);

/**
 * @route   DELETE /support/tickets/:id
 * @desc    Delete a support ticket
 * @access  Admin only
 */
router.delete("/tickets/:id", adminAuthenticate, (req: Request, res: Response) =>
    supportController.deleteTicket(req, res)
);

export { router as supportRoutes };
