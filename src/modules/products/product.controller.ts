import { Request, Response } from "express";
import { productService } from "./product.service";
import { ProductSearchParams } from "./product.types";
import { AuthError } from "../auth/auth.types";

export class ProductController {

    /**
     * GET /products
     * Get products with search and filters
     */
    async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const params: ProductSearchParams = {
                query: req.query.query as string,
                category: req.query.category as string,
                condition: req.query.condition as ProductSearchParams["condition"],
                min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
                store_id: req.query.store_id ? parseInt(req.query.store_id as string, 10) : undefined,
                sort_by: req.query.sort_by as ProductSearchParams["sort_by"],
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
            };

            const result = await productService.getProducts(params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/featured
     * Get featured products
     */
    async getFeaturedProducts(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
            const products = await productService.getFeaturedProducts(limit);

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/new-arrivals
     * Get new arrivals
     */
    async getNewArrivals(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
            const products = await productService.getNewArrivals(limit);

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/categories
     * Get all categories with product counts
     */
    async getCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await productService.getCategories();

            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/search/suggestions
     * Get search suggestions
     */
    async getSearchSuggestions(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

            const suggestions = await productService.getSearchSuggestions(query, limit);

            res.status(200).json({
                success: true,
                data: suggestions
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/category/:category
     * Get products by category
     */
    async getProductsByCategory(req: Request, res: Response): Promise<void> {
        try {
            const category = req.params.category;
            const params: ProductSearchParams = {
                condition: req.query.condition as ProductSearchParams["condition"],
                min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
                sort_by: req.query.sort_by as ProductSearchParams["sort_by"],
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
            };

            const result = await productService.getProductsByCategory(category, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/store/:storeId
     * Get products by store
     */
    async getProductsByStore(req: Request, res: Response): Promise<void> {
        try {
            const storeId = parseInt(req.params.storeId, 10);

            if (isNaN(storeId)) {
                res.status(400).json({ success: false, message: "Invalid store ID" });
                return;
            }

            const params: ProductSearchParams = {
                condition: req.query.condition as ProductSearchParams["condition"],
                min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
                sort_by: req.query.sort_by as ProductSearchParams["sort_by"],
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
            };

            const result = await productService.getProductsByStore(storeId, params);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /products/:id
     * Get product details
     */
    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const productId = parseInt(req.params.id, 10);

            if (isNaN(productId)) {
                res.status(400).json({ success: false, message: "Invalid product ID" });
                return;
            }

            const product = await productService.getProductById(productId);

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("Product Error:", error);

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
export const productController = new ProductController();
