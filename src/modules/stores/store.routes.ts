import { Router, Request, Response } from "express";
import { storeController } from "./store.controller";

const router = Router();

// ============== PUBLIC ROUTES (No authentication required) ==============

/**
 * @route   GET /stores
 * @desc    Get all stores with search and filters
 * @access  Public
 * @query   query, sort_by (rating|newest|popular), is_verified, page, limit
 */
router.get("/", (req: Request, res: Response) =>
    storeController.getStores(req, res)
);

/**
 * @route   GET /stores/featured
 * @desc    Get featured (verified, top rated) stores
 * @access  Public
 * @query   limit
 */
router.get("/featured", (req: Request, res: Response) =>
    storeController.getFeaturedStores(req, res)
);

/**
 * @route   GET /stores/slug/:slug
 * @desc    Get store by slug
 * @access  Public
 */
router.get("/slug/:slug", (req: Request, res: Response) =>
    storeController.getStoreBySlug(req, res)
);

/**
 * @route   GET /stores/:id
 * @desc    Get store by ID
 * @access  Public
 */
router.get("/:id", (req: Request, res: Response) =>
    storeController.getStoreById(req, res)
);

/**
 * @route   GET /stores/:id/products
 * @desc    Get store products
 * @access  Public
 * @query   page, limit, category, sort_by (price_asc|price_desc|newest|popular)
 */
router.get("/:id/products", (req: Request, res: Response) =>
    storeController.getStoreProducts(req, res)
);

/**
 * @route   GET /stores/:id/reviews
 * @desc    Get store reviews
 * @access  Public
 * @query   page, limit
 */
router.get("/:id/reviews", (req: Request, res: Response) =>
    storeController.getStoreReviews(req, res)
);

/**
 * @route   GET /stores/:id/categories
 * @desc    Get store product categories
 * @access  Public
 */
router.get("/:id/categories", (req: Request, res: Response) =>
    storeController.getStoreCategories(req, res)
);

export { router as storeRoutes };
