import { Request, Response } from "express";
import { sellerDocumentsService } from "./sellerDocuments.service";
import {
    UploadDocumentRequest,
    UpdateDocumentRequest
} from "./sellerDocuments.types";
import { AuthError } from "../auth/auth.types";

export class SellerDocumentsController {

    /**
     * GET /seller/documents
     * Get all documents for the seller
     */
    async getDocuments(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const documents = await sellerDocumentsService.getDocuments(userId);

            res.status(200).json({
                success: true,
                data: documents
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /seller/documents/status
     * Get verification status
     */
    async getVerificationStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const status = await sellerDocumentsService.getVerificationStatus(userId);

            res.status(200).json({
                success: true,
                data: status
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /seller/documents/:id
     * Get document by ID
     */
    async getDocumentById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const documentId = parseInt(req.params.id, 10);

            if (isNaN(documentId)) {
                res.status(400).json({ success: false, message: "Invalid document ID" });
                return;
            }

            const document = await sellerDocumentsService.getDocumentById(userId, documentId);

            res.status(200).json({
                success: true,
                data: document
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * GET /seller/documents/type/:type
     * Get document by type
     */
    async getDocumentByType(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const documentType = req.params.type;

            const validTypes = ["aadhar", "pan", "gst", "bank"];
            if (!validTypes.includes(documentType)) {
                res.status(400).json({ success: false, message: "Invalid document type" });
                return;
            }

            const document = await sellerDocumentsService.getDocumentByType(userId, documentType);

            res.status(200).json({
                success: true,
                data: document
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * POST /seller/documents
     * Upload a new document
     */
    async uploadDocument(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const data: UploadDocumentRequest = req.body;

            if (!data.document_type || !data.document_number || !data.document_url) {
                res.status(400).json({
                    success: false,
                    message: "document_type, document_number, and document_url are required"
                });
                return;
            }

            const document = await sellerDocumentsService.uploadDocument(userId, data);

            res.status(201).json({
                success: true,
                message: "Document uploaded successfully. It will be reviewed shortly.",
                data: document
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * PATCH /seller/documents/:id
     * Update a document
     */
    async updateDocument(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const documentId = parseInt(req.params.id, 10);
            const data: UpdateDocumentRequest = req.body;

            if (isNaN(documentId)) {
                res.status(400).json({ success: false, message: "Invalid document ID" });
                return;
            }

            const document = await sellerDocumentsService.updateDocument(userId, documentId, data);

            res.status(200).json({
                success: true,
                message: "Document updated successfully. It will be reviewed shortly.",
                data: document
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * DELETE /seller/documents/:id
     * Delete a document
     */
    async deleteDocument(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const documentId = parseInt(req.params.id, 10);

            if (isNaN(documentId)) {
                res.status(400).json({ success: false, message: "Invalid document ID" });
                return;
            }

            await sellerDocumentsService.deleteDocument(userId, documentId);

            res.status(200).json({
                success: true,
                message: "Document deleted successfully"
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Centralized error handler
     */
    private handleError(error: unknown, res: Response): void {
        console.error("SellerDocuments Error:", error);

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
