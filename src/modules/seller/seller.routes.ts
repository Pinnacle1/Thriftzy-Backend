import { Router, Request, Response } from "express";
import { sellerController } from "./seller.controller";
import { sellerDocumentsRoutes } from "../sellerDocuments/sellerDocuments.routes";
import { authenticate, sellerOnly } from "../auth/auth.middleware";

const router = Router();

// ============== ALL ROUTES REQUIRE SELLER AUTHENTICATION ==============

// Apply seller-only middleware to all routes
router.use(authenticate, sellerOnly);

// ============== DASHBOARD ==============

/**
 * @route   GET /seller/dashboard
 * @desc    Get seller dashboard with stats
 * @access  Seller Only
 */
router.get("/dashboard", (req: Request, res: Response) =>
    sellerController.getDashboard(req, res)
);

/**
 * @route   GET /seller/profile
 * @desc    Get seller profile
 * @access  Seller Only
 */
router.get("/profile", (req: Request, res: Response) =>
    sellerController.getProfile(req, res)
);

// ============== STORES ==============

/**
 * @route   GET /seller/stores
 * @desc    Get all stores
 * @access  Seller Only
 */
router.get("/stores", (req: Request, res: Response) =>
    sellerController.getStores(req, res)
);

/**
 * @route   GET /seller/stores/:id
 * @desc    Get store by ID
 * @access  Seller Only
 */
router.get("/stores/:id", (req: Request, res: Response) =>
    sellerController.getStoreById(req, res)
);

/**
 * @route   POST /seller/stores
 * @desc    Create a new store
 * @access  Seller Only
 * @body    { name, slug?, description, logo_url? }
 */
router.post("/stores", (req: Request, res: Response) =>
    sellerController.createStore(req, res)
);

/**
 * @route   PATCH /seller/stores/:id
 * @desc    Update store
 * @access  Seller Only
 * @body    { name?, description?, logo_url?, is_active? }
 */
router.patch("/stores/:id", (req: Request, res: Response) =>
    sellerController.updateStore(req, res)
);

/**
 * @route   DELETE /seller/stores/:id
 * @desc    Delete store
 * @access  Seller Only
 */
router.delete("/stores/:id", (req: Request, res: Response) =>
    sellerController.deleteStore(req, res)
);

// ============== PRODUCTS ==============

/**
 * @route   GET /seller/products
 * @desc    Get all products
 * @access  Seller Only
 * @query   page, limit, store_id, category, condition
 */
router.get("/products", (req: Request, res: Response) =>
    sellerController.getProducts(req, res)
);

/**
 * @route   GET /seller/products/:id
 * @desc    Get product by ID
 * @access  Seller Only
 */
router.get("/products/:id", (req: Request, res: Response) =>
    sellerController.getProductById(req, res)
);

/**
 * @route   POST /seller/products
 * @desc    Create a new product
 * @access  Seller Only
 * @body    { store_id, title, description, category, condition, price, quantity, images?, attributes? }
 */
router.post("/products", (req: Request, res: Response) =>
    sellerController.createProduct(req, res)
);

/**
 * @route   PATCH /seller/products/:id
 * @desc    Update product
 * @access  Seller Only
 * @body    { title?, description?, category?, condition?, price?, quantity?, is_active? }
 */
router.patch("/products/:id", (req: Request, res: Response) =>
    sellerController.updateProduct(req, res)
);

/**
 * @route   DELETE /seller/products/:id
 * @desc    Delete product
 * @access  Seller Only
 */
router.delete("/products/:id", (req: Request, res: Response) =>
    sellerController.deleteProduct(req, res)
);

// ============== ORDERS ==============

/**
 * @route   GET /seller/orders
 * @desc    Get all orders received
 * @access  Seller Only
 * @query   page, limit, store_id, status
 */
router.get("/orders", (req: Request, res: Response) =>
    sellerController.getOrders(req, res)
);

/**
 * @route   GET /seller/orders/:id
 * @desc    Get order by ID
 * @access  Seller Only
 */
router.get("/orders/:id", (req: Request, res: Response) =>
    sellerController.getOrderById(req, res)
);

/**
 * @route   PATCH /seller/orders/:id/status
 * @desc    Update order status
 * @access  Seller Only
 * @body    { status: "shipped" | "delivered" | "cancelled", tracking_number?, notes? }
 */
router.patch("/orders/:id/status", (req: Request, res: Response) =>
    sellerController.updateOrderStatus(req, res)
);

// ============== PAYOUTS ==============

/**
 * @route   GET /seller/payouts
 * @desc    Get all payouts
 * @access  Seller Only
 * @query   page, limit, status
 */
router.get("/payouts", (req: Request, res: Response) =>
    sellerController.getPayouts(req, res)
);

// ============== DOCUMENTS (mounted from sellerDocuments module) ==============
// Routes: /seller/documents/*
router.use("/documents", sellerDocumentsRoutes);

export { router as sellerRoutes };
