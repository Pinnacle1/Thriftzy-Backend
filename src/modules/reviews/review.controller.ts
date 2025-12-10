import { Request, Response } from "express";
import { reviewService } from "./review.service";
import {
    CreateProductReviewRequest,
    CreateStoreReviewRequest,
    UpdateReviewRequest,
    ReviewQueryParams
} from "./review.types";
import { AuthError } from "../auth/auth.types";

export class ReviewController {

    // ============== PRODUCT REVIEWS ==============

    /**
     * GET /reviews/products/:productId
     * Get reviews for a product
     */
    async getProductReviews(req: Request, res: Response): Promise<void> {
        try {
            const productId = parseInt(req.params.productId, 10);

            if (isNaN(productId)) {
                res.status(400).json({ success: false, message: "Invalid product ID" });
                return;
            }

            const params: ReviewQueryParams = {
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sort_by: req.query.sort_by as ReviewQueryParams["sort_by"]
            };

            const result = await reviewService.getProductReviews(productId, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /reviews/products/:productId/can-review
     * Check if user can review a product
     */
    async canReviewProduct(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const productId = parseInt(req.params.productId, 10);

            if (isNaN(productId)) {
                res.status(400).json({ success: false, message: "Invalid product ID" });
                return;
            }

            const result = await reviewService.canReviewProduct(userId, productId);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /reviews/products
     * Create a product review
     */
    async createProductReview(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: CreateProductReviewRequest = req.body;

            if (!data.product_id || !data.rating || !data.title || !data.description) {
                res.status(400).json({
                    success: false,
                    message: "product_id, rating, title, and description are required"
                });
                return;
            }

            const review = await reviewService.createProductReview(userId, data);

            res.status(201).json({
                success: true,
                message: "Review submitted successfully",
                data: review
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== STORE REVIEWS ==============

    /**
     * GET /reviews/stores/:storeId
     * Get reviews for a store
     */
    async getStoreReviews(req: Request, res: Response): Promise<void> {
        try {
            const storeId = parseInt(req.params.storeId, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const params: ReviewQueryParams = {
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sort_by: req.query.sort_by as ReviewQueryParams["sort_by"]
            };

            const result = await reviewService.getStoreReviews(storeId, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /reviews/stores/:storeId/can-review
     * Check if user can review a store
     */
    async canReviewStore(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const storeId = parseInt(req.params.storeId, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const result = await reviewService.canReviewStore(userId, storeId);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /reviews/stores
     * Create a store review
     */
    async createStoreReview(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: CreateStoreReviewRequest = req.body;

            if (!data.store_id || !data.rating || !data.title || !data.description) {
                res.status(400).json({
                    success: false,
                    message: "store_id, rating, title, and description are required"
                });
                return;
            }

            const review = await reviewService.createStoreReview(userId, data);

            res.status(201).json({
                success: true,
                message: "Review submitted successfully",
                data: review
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== USER REVIEWS ==============

    /**
     * GET /reviews/me
     * Get current user's reviews
     */
    async getUserReviews(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const reviews = await reviewService.getUserReviews(userId);

            res.status(200).json({
                success: true,
                data: reviews
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== SINGLE REVIEW ==============

    /**
     * GET /reviews/:id
     * Get review by ID
     */
    async getReviewById(req: Request, res: Response): Promise<void> {
        try {
            const reviewId = parseInt(req.params.id, 10);

            if (isNaN(reviewId)) {
                res.status(400).json({ success: false, message: "Invalid review ID" });
                return;
            }

            const review = await reviewService.getReviewById(reviewId);

            res.status(200).json({
                success: true,
                data: review
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /reviews/:id
     * Update a review
     */
    async updateReview(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const reviewId = parseInt(req.params.id, 10);
            const data: UpdateReviewRequest = req.body;

            if (isNaN(reviewId)) {
                res.status(400).json({ success: false, message: "Invalid review ID" });
                return;
            }

            const review = await reviewService.updateReview(userId, reviewId, data);

            res.status(200).json({
                success: true,
                message: "Review updated successfully",
                data: review
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /reviews/:id
     * Delete a review
     */
    async deleteReview(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const reviewId = parseInt(req.params.id, 10);

            if (isNaN(reviewId)) {
                res.status(400).json({ success: false, message: "Invalid review ID" });
                return;
            }

            await reviewService.deleteReview(userId, reviewId);

            res.status(200).json({
                success: true,
                message: "Review deleted successfully"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Review Error:", error);

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
export const reviewController = new ReviewController();
