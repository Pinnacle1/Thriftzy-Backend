import { Router, Request, Response } from "express";
import { cartController } from "./cart.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

// ============== ALL ROUTES REQUIRE AUTHENTICATION ==============

router.use(authenticate);

/**
 * @route   GET /cart
 * @desc    Get current user's cart with items
 * @access  Private
 */
router.get("/", (req: Request, res: Response) =>
    cartController.getCart(req, res)
);

/**
 * @route   GET /cart/count
 * @desc    Get total items count in cart
 * @access  Private
 */
router.get("/count", (req: Request, res: Response) =>
    cartController.getCartCount(req, res)
);

/**
 * @route   GET /cart/validate
 * @desc    Validate all cart items (check availability)
 * @access  Private
 */
router.get("/validate", (req: Request, res: Response) =>
    cartController.validateCart(req, res)
);

/**
 * @route   POST /cart/items
 * @desc    Add item to cart
 * @access  Private
 * @body    { product_id, quantity }
 */
router.post("/items", (req: Request, res: Response) =>
    cartController.addToCart(req, res)
);

/**
 * @route   PATCH /cart/items/:id
 * @desc    Update cart item quantity
 * @access  Private
 * @body    { quantity }
 */
router.patch("/items/:id", (req: Request, res: Response) =>
    cartController.updateCartItem(req, res)
);

/**
 * @route   DELETE /cart/items/:id
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete("/items/:id", (req: Request, res: Response) =>
    cartController.removeFromCart(req, res)
);

/**
 * @route   DELETE /cart/products/:productId
 * @desc    Remove product from cart (by product ID)
 * @access  Private
 */
router.delete("/products/:productId", (req: Request, res: Response) =>
    cartController.removeProductFromCart(req, res)
);

/**
 * @route   DELETE /cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete("/", (req: Request, res: Response) =>
    cartController.clearCart(req, res)
);

export { router as cartRoutes };
