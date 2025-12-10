import { Router, Request, Response } from "express";
import { productController } from "./product.controller";

const router = Router();

// ============== PUBLIC ROUTES (No authentication required) ==============

/**
 * @route   GET /products
 * @desc    Get products with search and filters
 * @access  Public
 * @query   query, category, condition, min_price, max_price, store_id, sort_by, page, limit
 */
router.get("/", (req: Request, res: Response) =>
    productController.getProducts(req, res)
);

/**
 * @route   GET /products/featured
 * @desc    Get featured products
 * @access  Public
 * @query   limit
 */
router.get("/featured", (req: Request, res: Response) =>
    productController.getFeaturedProducts(req, res)
);

/**
 * @route   GET /products/new-arrivals
 * @desc    Get new arrivals
 * @access  Public
 * @query   limit
 */
router.get("/new-arrivals", (req: Request, res: Response) =>
    productController.getNewArrivals(req, res)
);

/**
 * @route   GET /products/categories
 * @desc    Get all categories with product counts
 * @access  Public
 */
router.get("/categories", (req: Request, res: Response) =>
    productController.getCategories(req, res)
);

/**
 * @route   GET /products/search/suggestions
 * @desc    Get search suggestions
 * @access  Public
 * @query   q, limit
 */
router.get("/search/suggestions", (req: Request, res: Response) =>
    productController.getSearchSuggestions(req, res)
);

/**
 * @route   GET /products/category/:category
 * @desc    Get products by category
 * @access  Public
 * @query   condition, min_price, max_price, sort_by, page, limit
 */
router.get("/category/:category", (req: Request, res: Response) =>
    productController.getProductsByCategory(req, res)
);

/**
 * @route   GET /products/store/:storeId
 * @desc    Get products by store
 * @access  Public
 * @query   condition, min_price, max_price, sort_by, page, limit
 */
router.get("/store/:storeId", (req: Request, res: Response) =>
    productController.getProductsByStore(req, res)
);

/**
 * @route   GET /products/:id
 * @desc    Get product details
 * @access  Public
 */
router.get("/:id", (req: Request, res: Response) =>
    productController.getProductById(req, res)
);

export { router as productRoutes };
