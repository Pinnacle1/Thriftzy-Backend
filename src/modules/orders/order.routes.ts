import { Router, Request, Response } from "express";
import { orderController } from "./order.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

// ============== ALL ROUTES REQUIRE AUTHENTICATION ==============

router.use(authenticate);

/**
 * @route   GET /orders
 * @desc    Get user's orders
 * @access  Private
 * @query   status, page, limit
 */
router.get("/", (req: Request, res: Response) =>
    orderController.getUserOrders(req, res)
);

/**
 * @route   GET /orders/summary
 * @desc    Get order summary before checkout
 * @access  Private
 * @query   type (cart|items)
 */
router.get("/summary", (req: Request, res: Response) =>
    orderController.getOrderSummary(req, res)
);

/**
 * @route   GET /orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get("/:id", (req: Request, res: Response) =>
    orderController.getOrderById(req, res)
);

/**
 * @route   POST /orders/cart
 * @desc    Create order from cart (splits by store if needed)
 * @access  Private
 * @body    { address_id, payment_method? }
 */
router.post("/cart", (req: Request, res: Response) =>
    orderController.createOrderFromCart(req, res)
);

/**
 * @route   POST /orders/single
 * @desc    Create order for a single item (Buy Now)
 * @access  Private
 * @body    { product_id, quantity, address_id, payment_method? }
 */
router.post("/single", (req: Request, res: Response) =>
    orderController.createSingleItemOrder(req, res)
);

/**
 * @route   POST /orders/direct
 * @desc    Create order for multiple items directly (splits by store)
 * @access  Private
 * @body    { items: [{ product_id, quantity }], address_id, payment_method? }
 */
router.post("/direct", (req: Request, res: Response) =>
    orderController.createDirectOrder(req, res)
);

/**
 * @route   POST /orders/:id/cancel
 * @desc    Cancel an order (only pending orders)
 * @access  Private
 */
router.post("/:id/cancel", (req: Request, res: Response) =>
    orderController.cancelOrder(req, res)
);

export { router as orderRoutes };
