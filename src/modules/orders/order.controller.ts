import { Request, Response } from "express";
import { orderService } from "./order.service";
import {
    CreateOrderFromCartRequest,
    CreateSingleItemOrderRequest,
    CreateDirectOrderRequest,
    OrderQueryParams
} from "./order.types";
import { AuthError } from "../auth/auth.types";

export class OrderController {

    /**
     * GET /orders
     * Get user's orders
     */
    async getUserOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const params: OrderQueryParams = {
                status: req.query.status as OrderQueryParams["status"],
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10
            };

            const result = await orderService.getUserOrders(userId, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /orders/:id
     * Get order by ID
     */
    async getOrderById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const orderId = parseInt(req.params.id, 10);

            if (isNaN(orderId)) {
                res.status(400).json({ success: false, message: "Invalid order ID" });
                return;
            }

            const order = await orderService.getOrderById(userId, orderId);

            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /orders/cart
     * Create order from cart
     */
    async createOrderFromCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: CreateOrderFromCartRequest = req.body;

            if (!data.address_id) {
                res.status(400).json({
                    success: false,
                    message: "address_id is required"
                });
                return;
            }

            const result = await orderService.createOrderFromCart(userId, data);

            res.status(201).json({
                success: true,
                message: result.total_orders > 1
                    ? `${result.total_orders} orders created (items from different stores)`
                    : "Order created successfully",
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /orders/single
     * Create order for a single item (buy now)
     */
    async createSingleItemOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: CreateSingleItemOrderRequest = req.body;

            if (!data.product_id || !data.quantity || !data.address_id) {
                res.status(400).json({
                    success: false,
                    message: "product_id, quantity, and address_id are required"
                });
                return;
            }

            const result = await orderService.createSingleItemOrder(userId, data);

            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /orders/direct
     * Create order for multiple items directly (without cart)
     */
    async createDirectOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: CreateDirectOrderRequest = req.body;

            if (!data.items?.length || !data.address_id) {
                res.status(400).json({
                    success: false,
                    message: "items array and address_id are required"
                });
                return;
            }

            const result = await orderService.createDirectOrder(userId, data);

            res.status(201).json({
                success: true,
                message: result.total_orders > 1
                    ? `${result.total_orders} orders created (items from different stores)`
                    : "Order created successfully",
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /orders/:id/cancel
     * Cancel an order
     */
    async cancelOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const orderId = parseInt(req.params.id, 10);

            if (isNaN(orderId)) {
                res.status(400).json({ success: false, message: "Invalid order ID" });
                return;
            }

            const order = await orderService.cancelOrder(userId, orderId);

            res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                data: order
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /orders/summary
     * Get order summary before checkout
     */
    async getOrderSummary(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const type = req.query.type as "cart" | "items" || "cart";

            let items: { product_id: number; quantity: number }[] | undefined;

            if (type === "items" && req.body.items) {
                items = req.body.items;
            }

            const summary = await orderService.getOrderSummary(userId, type, items);

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Order Error:", error);

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
export const orderController = new OrderController();
