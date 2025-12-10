import { Repository } from "typeorm";
import { SellerDocument } from "./sellerDocuments.entity";
import { SellerProfile } from "../seller/sellerProfile.entity";
import { AppDataSource } from "../../db/data-source";
import {
    UploadDocumentRequest,
    UpdateDocumentRequest,
    DocumentResponse
} from "./sellerDocuments.types";
import { NotFoundError, ValidationError } from "../auth/auth.types";

export class SellerDocumentsService {
    private documentRepository: Repository<SellerDocument>;
    private sellerProfileRepository: Repository<SellerProfile>;

    constructor() {
        this.documentRepository = AppDataSource.getRepository(SellerDocument);
        this.sellerProfileRepository = AppDataSource.getRepository(SellerProfile);
    }

    // ============== GET ALL DOCUMENTS ==============

    async getDocuments(userId: number): Promise<DocumentResponse[]> {
        const profile = await this.getSellerProfile(userId);

        const documents = await this.documentRepository.find({
            where: { seller_id: profile.id },
            order: { created_at: "DESC" }
        });

        return documents.map(doc => this.toDocumentResponse(doc));
    }

    // ============== GET DOCUMENT BY ID ==============

    async getDocumentById(userId: number, documentId: number): Promise<DocumentResponse> {
        const profile = await this.getSellerProfile(userId);

        const document = await this.documentRepository.findOne({
            where: { id: documentId, seller_id: profile.id }
        });

        if (!document) {
            throw new NotFoundError("Document not found");
        }

        return this.toDocumentResponse(document);
    }

    // ============== GET DOCUMENT BY TYPE ==============

    async getDocumentByType(userId: number, documentType: string): Promise<DocumentResponse | null> {
        const profile = await this.getSellerProfile(userId);

        const document = await this.documentRepository.findOne({
            where: {
                seller_id: profile.id,
                document_type: documentType as "aadhar" | "pan" | "gst" | "bank"
            }
        });

        if (!document) {
            return null;
        }

        return this.toDocumentResponse(document);
    }

    // ============== UPLOAD DOCUMENT ==============

    async uploadDocument(userId: number, data: UploadDocumentRequest): Promise<DocumentResponse> {
        const profile = await this.getSellerProfile(userId);

        // Validate document type
        const validTypes = ["aadhar", "pan", "gst", "bank"];
        if (!validTypes.includes(data.document_type)) {
            throw new ValidationError("Invalid document type");
        }

        // Check if document type already exists
        const existing = await this.documentRepository.findOne({
            where: { seller_id: profile.id, document_type: data.document_type }
        });

        if (existing) {
            // Cannot upload if already approved
            if (existing.status === "approved") {
                throw new ValidationError(`${data.document_type.toUpperCase()} document is already approved`);
            }

            // Update existing document (re-submission)
            existing.document_number = data.document_number;
            existing.document_url = data.document_url;
            existing.status = "pending";
            existing.reason = "";
            await this.documentRepository.save(existing);
            return this.toDocumentResponse(existing);
        }

        // Create new document
        const document = this.documentRepository.create({
            seller_id: profile.id,
            document_type: data.document_type,
            document_number: data.document_number,
            document_url: data.document_url,
            status: "pending",
            reason: ""
        });

        await this.documentRepository.save(document);

        return this.toDocumentResponse(document);
    }

    // ============== UPDATE DOCUMENT ==============

    async updateDocument(userId: number, documentId: number, data: UpdateDocumentRequest): Promise<DocumentResponse> {
        const profile = await this.getSellerProfile(userId);

        const document = await this.documentRepository.findOne({
            where: { id: documentId, seller_id: profile.id }
        });

        if (!document) {
            throw new NotFoundError("Document not found");
        }

        // Cannot update approved document
        if (document.status === "approved") {
            throw new ValidationError("Cannot update approved document");
        }

        if (data.document_number !== undefined) {
            document.document_number = data.document_number;
        }
        if (data.document_url !== undefined) {
            document.document_url = data.document_url;
        }

        // Reset status to pending after update
        document.status = "pending";
        document.reason = "";

        await this.documentRepository.save(document);

        return this.toDocumentResponse(document);
    }

    // ============== DELETE DOCUMENT ==============

    async deleteDocument(userId: number, documentId: number): Promise<void> {
        const profile = await this.getSellerProfile(userId);

        const document = await this.documentRepository.findOne({
            where: { id: documentId, seller_id: profile.id }
        });

        if (!document) {
            throw new NotFoundError("Document not found");
        }

        // Cannot delete approved document
        if (document.status === "approved") {
            throw new ValidationError("Cannot delete approved document");
        }

        await this.documentRepository.remove(document);
    }

    // ============== GET VERIFICATION STATUS ==============

    async getVerificationStatus(userId: number): Promise<{
        is_fully_verified: boolean;
        documents: {
            type: string;
            status: "pending" | "approved" | "rejected" | "not_uploaded";
        }[];
    }> {
        const profile = await this.getSellerProfile(userId);

        const documents = await this.documentRepository.find({
            where: { seller_id: profile.id }
        });

        const requiredTypes = ["aadhar", "pan", "gst", "bank"] as const;
        const documentMap = new Map(documents.map(d => [d.document_type, d.status]));

        const documentStatuses = requiredTypes.map(type => ({
            type,
            status: (documentMap.get(type) || "not_uploaded") as "pending" | "approved" | "rejected" | "not_uploaded"
        }));

        const isFullyVerified = requiredTypes.every(
            type => documentMap.get(type) === "approved"
        );

        return {
            is_fully_verified: isFullyVerified,
            documents: documentStatuses
        };
    }

    // ============== HELPER METHODS ==============

    private async getSellerProfile(userId: number): Promise<SellerProfile> {
        const profile = await this.sellerProfileRepository.findOne({
            where: { user_id: userId }
        });

        if (!profile) {
            throw new NotFoundError("Seller profile not found. Please complete seller registration.");
        }

        return profile;
    }

    private toDocumentResponse(doc: SellerDocument): DocumentResponse {
        return {
            id: doc.id,
            document_type: doc.document_type,
            document_number: doc.document_number,
            document_url: doc.document_url,
            status: doc.status,
            reason: doc.reason,
            created_at: doc.created_at,
            updated_at: doc.updated_at
        };
    }
}

// Export singleton instance
export const sellerDocumentsService = new SellerDocumentsService();
