import { Router, Request, Response } from "express";
import { sellerDocumentsController } from "./sellerDocuments.controller";

const router = Router();

// Note: Authentication and seller-only middleware are applied by the parent route (/seller/kyc)

// ============== KYC STATUS ==============

/**
 * @route   GET /seller/kyc/status
 * @desc    Get overall KYC status for all document types
 * @access  Seller Only
 */
router.get("/status", (req: Request, res: Response) =>
    sellerDocumentsController.getKycStatus(req, res)
);

// ============== PAN KYC ==============

/**
 * @route   GET /seller/kyc/pan
 * @desc    Get PAN KYC details
 * @access  Seller Only
 */
router.get("/pan", (req: Request, res: Response) =>
    sellerDocumentsController.getPanKyc(req, res)
);

/**
 * @route   POST /seller/kyc/pan
 * @desc    Submit PAN KYC
 * @access  Seller Only
 * @body    { pan_name, pan_number }
 */
router.post("/pan", (req: Request, res: Response) =>
    sellerDocumentsController.submitPanKyc(req, res)
);

/**
 * @route   PATCH /seller/kyc/pan
 * @desc    Update PAN KYC
 * @access  Seller Only
 * @body    { pan_name?, pan_number? }
 */
router.patch("/pan", (req: Request, res: Response) =>
    sellerDocumentsController.updatePanKyc(req, res)
);

/**
 * @route   DELETE /seller/kyc/pan
 * @desc    Delete PAN KYC (only if not verified)
 * @access  Seller Only
 */
router.delete("/pan", (req: Request, res: Response) =>
    sellerDocumentsController.deletePanKyc(req, res)
);

// ============== AADHAAR KYC ==============

/**
 * @route   GET /seller/kyc/aadhaar
 * @desc    Get Aadhaar KYC details
 * @access  Seller Only
 */
router.get("/aadhaar", (req: Request, res: Response) =>
    sellerDocumentsController.getAadhaarKyc(req, res)
);

/**
 * @route   POST /seller/kyc/aadhaar
 * @desc    Submit Aadhaar KYC
 * @access  Seller Only
 * @body    { aadhaar_name, aadhaar_number }
 */
router.post("/aadhaar", (req: Request, res: Response) =>
    sellerDocumentsController.submitAadhaarKyc(req, res)
);

/**
 * @route   PATCH /seller/kyc/aadhaar
 * @desc    Update Aadhaar KYC
 * @access  Seller Only
 * @body    { aadhaar_name?, aadhaar_number? }
 */
router.patch("/aadhaar", (req: Request, res: Response) =>
    sellerDocumentsController.updateAadhaarKyc(req, res)
);

/**
 * @route   DELETE /seller/kyc/aadhaar
 * @desc    Delete Aadhaar KYC (only if not verified)
 * @access  Seller Only
 */
router.delete("/aadhaar", (req: Request, res: Response) =>
    sellerDocumentsController.deleteAadhaarKyc(req, res)
);

// ============== BANK KYC ==============

/**
 * @route   GET /seller/kyc/bank
 * @desc    Get Bank KYC details
 * @access  Seller Only
 */
router.get("/bank", (req: Request, res: Response) =>
    sellerDocumentsController.getBankKyc(req, res)
);

/**
 * @route   POST /seller/kyc/bank
 * @desc    Submit Bank KYC
 * @access  Seller Only
 * @body    { account_holder_name, account_number, ifsc_code }
 */
router.post("/bank", (req: Request, res: Response) =>
    sellerDocumentsController.submitBankKyc(req, res)
);

/**
 * @route   PATCH /seller/kyc/bank
 * @desc    Update Bank KYC
 * @access  Seller Only
 * @body    { account_holder_name?, account_number?, ifsc_code? }
 */
router.patch("/bank", (req: Request, res: Response) =>
    sellerDocumentsController.updateBankKyc(req, res)
);

/**
 * @route   DELETE /seller/kyc/bank
 * @desc    Delete Bank KYC (only if not verified)
 * @access  Seller Only
 */
router.delete("/bank", (req: Request, res: Response) =>
    sellerDocumentsController.deleteBankKyc(req, res)
);

export { router as sellerDocumentsRoutes };
