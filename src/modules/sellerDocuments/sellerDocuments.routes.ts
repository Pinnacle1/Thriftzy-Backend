import { Router, Request, Response } from "express";
import { sellerDocumentsController } from "./sellerDocuments.controller";

const router = Router();

// Note: Authentication and seller-only middleware are applied by the parent route (/seller/documents)

/**
 * @route   GET /seller/documents
 * @desc    Get all documents for the seller
 * @access  Seller Only
 */
router.get("/", (req: Request, res: Response) =>
    sellerDocumentsController.getDocuments(req, res)
);

/**
 * @route   GET /seller/documents/status
 * @desc    Get verification status for all document types
 * @access  Seller Only
 */
router.get("/status", (req: Request, res: Response) =>
    sellerDocumentsController.getVerificationStatus(req, res)
);

/**
 * @route   GET /seller/documents/type/:type
 * @desc    Get document by type (aadhar, pan, gst, bank)
 * @access  Seller Only
 */
router.get("/type/:type", (req: Request, res: Response) =>
    sellerDocumentsController.getDocumentByType(req, res)
);

/**
 * @route   GET /seller/documents/:id
 * @desc    Get document by ID
 * @access  Seller Only
 */
router.get("/:id", (req: Request, res: Response) =>
    sellerDocumentsController.getDocumentById(req, res)
);

/**
 * @route   POST /seller/documents
 * @desc    Upload a new document
 * @access  Seller Only
 * @body    { document_type, document_number, document_url }
 */
router.post("/", (req: Request, res: Response) =>
    sellerDocumentsController.uploadDocument(req, res)
);

/**
 * @route   PATCH /seller/documents/:id
 * @desc    Update a document
 * @access  Seller Only
 * @body    { document_number?, document_url? }
 */
router.patch("/:id", (req: Request, res: Response) =>
    sellerDocumentsController.updateDocument(req, res)
);

/**
 * @route   DELETE /seller/documents/:id
 * @desc    Delete a document (only if not approved)
 * @access  Seller Only
 */
router.delete("/:id", (req: Request, res: Response) =>
    sellerDocumentsController.deleteDocument(req, res)
);

export { router as sellerDocumentsRoutes };
