import { Request, Response } from "express";
import { storeService } from "./store.service";
import { StoreSearchParams } from "./store.types";
import { AuthError } from "../auth/auth.types";

export class StoreController {

    /**
     * GET /stores
     * Get all stores with search and filters
     */
    async getStores(req: Request, res: Response): Promise<void> {
        try {
            const params: StoreSearchParams = {
                query: req.query.query as string,
                sort_by: req.query.sort_by as StoreSearchParams["sort_by"],
                is_verified: req.query.is_verified === "true" ? true : undefined,
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
            };

            const result = await storeService.getStores(params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /stores/featured
     * Get featured stores
     */
    async getFeaturedStores(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
            const stores = await storeService.getFeaturedStores(limit);

            res.status(200).json({
                success: true,
                data: stores
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /stores/slug/:slug
     * Get store by slug
     */
    async getStoreBySlug(req: Request, res: Response): Promise<void> {
        try {
            const slug = req.params.slug;
            const store = await storeService.getStoreBySlug(slug);

            res.status(200).json({
                success: true,
                data: store
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /stores/:id
     * Get store by ID
     */
    async getStoreById(req: Request, res: Response): Promise<void> {
        try {
            const storeId = parseInt(req.params.id, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const store = await storeService.getStoreById(storeId);

            res.status(200).json({
                success: true,
                data: store
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /stores/:id/products
     * Get store products
     */
    async getStoreProducts(req: Request, res: Response): Promise<void> {
        try {
            const storeId = parseInt(req.params.id, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const params = {
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
                category: req.query.category as string,
                sort_by: req.query.sort_by as string
            };

            const result = await storeService.getStoreProducts(storeId, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /stores/:id/reviews
     * Get store reviews
     */
    async getStoreReviews(req: Request, res: Response): Promise<void> {
        try {
            const storeId = parseInt(req.params.id, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const params = {
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10
            };

            const result = await storeService.getStoreReviews(storeId, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /stores/:id/categories
     * Get store product categories
     */
    async getStoreCategories(req: Request, res: Response): Promise<void> {
        try {
            const storeId = parseInt(req.params.id, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const categories = await storeService.getStoreCategories(storeId);

            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Store Error:", error);

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
export const storeController = new StoreController();
