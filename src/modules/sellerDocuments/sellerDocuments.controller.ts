import { Request, Response } from "express";
import { sellerDocumentsService } from "./sellerDocuments.service";
import {
    SubmitPanKycRequest,
    UpdatePanKycRequest,
    SubmitAadhaarKycRequest,
    UpdateAadhaarKycRequest,
    SubmitBankKycRequest,
    UpdateBankKycRequest
} from "./sellerDocuments.types";
import { AuthError } from "../auth/auth.types";

export class SellerDocumentsController {

    // ============== KYC STATUS ==============

    /**
     * GET /seller/kyc/status
     * Get overall KYC status for the seller
     */
    async getKycStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const status = await sellerDocumentsService.getKycStatus(userId);

            res.status(200).json({
                success: true,
                data: status
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== PAN KYC ==============

    /**
     * GET /seller/kyc/pan
     * Get PAN KYC details
     */
    async getPanKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const pan = await sellerDocumentsService.getPanKyc(userId);

            res.status(200).json({
                success: true,
                data: pan
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /seller/kyc/pan
     * Submit PAN KYC
     */
    async submitPanKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: SubmitPanKycRequest = req.body;

            if (!data.pan_name || !data.pan_number) {
                res.status(400).json({
                    success: false,
                    message: "pan_name and pan_number are required"
                });
                return;
            }

            const pan = await sellerDocumentsService.submitPanKyc(userId, data);

            res.status(201).json({
                success: true,
                message: "PAN submitted successfully. Verification is pending.",
                data: pan
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /seller/kyc/pan
     * Update PAN KYC
     */
    async updatePanKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: UpdatePanKycRequest = req.body;

            const pan = await sellerDocumentsService.updatePanKyc(userId, data);

            res.status(200).json({
                success: true,
                message: "PAN updated successfully. Verification is pending.",
                data: pan
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /seller/kyc/pan
     * Delete PAN KYC
     */
    async deletePanKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            await sellerDocumentsService.deletePanKyc(userId);

            res.status(200).json({
                success: true,
                message: "PAN record deleted successfully"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== AADHAAR KYC ==============

    /**
     * GET /seller/kyc/aadhaar
     * Get Aadhaar KYC details
     */
    async getAadhaarKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const aadhaar = await sellerDocumentsService.getAadhaarKyc(userId);

            res.status(200).json({
                success: true,
                data: aadhaar
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /seller/kyc/aadhaar
     * Submit Aadhaar KYC
     */
    async submitAadhaarKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: SubmitAadhaarKycRequest = req.body;

            if (!data.aadhaar_name || !data.aadhaar_number) {
                res.status(400).json({
                    success: false,
                    message: "aadhaar_name and aadhaar_number are required"
                });
                return;
            }

            const aadhaar = await sellerDocumentsService.submitAadhaarKyc(userId, data);

            res.status(201).json({
                success: true,
                message: "Aadhaar submitted successfully. Verification is pending.",
                data: aadhaar
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /seller/kyc/aadhaar
     * Update Aadhaar KYC
     */
    async updateAadhaarKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: UpdateAadhaarKycRequest = req.body;

            const aadhaar = await sellerDocumentsService.updateAadhaarKyc(userId, data);

            res.status(200).json({
                success: true,
                message: "Aadhaar updated successfully. Verification is pending.",
                data: aadhaar
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /seller/kyc/aadhaar
     * Delete Aadhaar KYC
     */
    async deleteAadhaarKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            await sellerDocumentsService.deleteAadhaarKyc(userId);

            res.status(200).json({
                success: true,
                message: "Aadhaar record deleted successfully"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== BANK KYC ==============

    /**
     * GET /seller/kyc/bank
     * Get Bank KYC details
     */
    async getBankKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const bank = await sellerDocumentsService.getBankKyc(userId);

            res.status(200).json({
                success: true,
                data: bank
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /seller/kyc/bank
     * Submit Bank KYC
     */
    async submitBankKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: SubmitBankKycRequest = req.body;

            if (!data.account_holder_name || !data.account_number || !data.ifsc_code) {
                res.status(400).json({
                    success: false,
                    message: "account_holder_name, account_number, and ifsc_code are required"
                });
                return;
            }

            const bank = await sellerDocumentsService.submitBankKyc(userId, data);

            res.status(201).json({
                success: true,
                message: "Bank details submitted successfully. Verification is pending.",
                data: bank
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /seller/kyc/bank
     * Update Bank KYC
     */
    async updateBankKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: UpdateBankKycRequest = req.body;

            const bank = await sellerDocumentsService.updateBankKyc(userId, data);

            res.status(200).json({
                success: true,
                message: "Bank details updated successfully. Verification is pending.",
                data: bank
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /seller/kyc/bank
     * Delete Bank KYC
     */
    async deleteBankKyc(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            await sellerDocumentsService.deleteBankKyc(userId);

            res.status(200).json({
                success: true,
                message: "Bank record deleted successfully"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // ============== ERROR HANDLER ==============

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("SellerKYC Error:", error);

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
export const sellerDocumentsController = new SellerDocumentsController();
