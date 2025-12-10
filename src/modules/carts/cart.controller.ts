import { Request, Response } from "express";
import { cartService } from "./cart.service";
import { AddToCartRequest, UpdateCartItemRequest } from "./cart.types";
import { AuthError } from "../auth/auth.types";

export class CartController {

    /**
     * GET /cart
     * Get current user's cart
     */
    async getCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const cart = await cartService.getCart(userId);

            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /cart/count
     * Get cart item count
     */
    async getCartCount(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const count = await cartService.getCartCount(userId);

            res.status(200).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /cart/validate
     * Validate cart items
     */
    async validateCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const result = await cartService.validateCart(userId);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /cart/items
     * Add item to cart
     */
    async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: AddToCartRequest = req.body;

            if (!data.product_id || data.quantity === undefined) {
                res.status(400).json({
                    success: false,
                    message: "product_id and quantity are required"
                });
                return;
            }

            const result = await cartService.addToCart(userId, data);

            res.status(200).json({
                success: true,
                message: "Item added to cart",
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /cart/items/:id
     * Update cart item quantity
     */
    async updateCartItem(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const itemId = parseInt(req.params.id, 10);
            const { quantity }: UpdateCartItemRequest = req.body;

            if (isNaN(itemId)) {
                res.status(400).json({ success: false, message: "Invalid item ID" });
                return;
            }

            if (quantity === undefined || quantity < 1) {
                res.status(400).json({
                    success: false,
                    message: "quantity is required and must be at least 1"
                });
                return;
            }

            const item = await cartService.updateCartItem(userId, itemId, quantity);

            res.status(200).json({
                success: true,
                message: "Cart item updated",
                data: item
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /cart/items/:id
     * Remove item from cart
     */
    async removeFromCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const itemId = parseInt(req.params.id, 10);

            if (isNaN(itemId)) {
                res.status(400).json({ success: false, message: "Invalid item ID" });
                return;
            }

            await cartService.removeFromCart(userId, itemId);

            res.status(200).json({
                success: true,
                message: "Item removed from cart"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /cart/products/:productId
     * Remove product from cart
     */
    async removeProductFromCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const productId = parseInt(req.params.productId, 10);

            if (isNaN(productId)) {
                res.status(400).json({ success: false, message: "Invalid product ID" });
                return;
            }

            await cartService.removeProductFromCart(userId, productId);

            res.status(200).json({
                success: true,
                message: "Product removed from cart"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /cart
     * Clear entire cart
     */
    async clearCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            await cartService.clearCart(userId);

            res.status(200).json({
                success: true,
                message: "Cart cleared"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Cart Error:", error);

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
export const cartController = new CartController();
