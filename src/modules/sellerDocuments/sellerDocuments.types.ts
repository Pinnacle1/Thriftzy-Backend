// ============== Request DTOs ==============

export interface UploadDocumentRequest {
    document_type: "aadhar" | "pan" | "gst" | "bank";
    document_number: string;
    document_url: string;
}

export interface UpdateDocumentRequest {
    document_number?: string;
    document_url?: string;
}

// ============== Response DTOs ==============

export interface DocumentResponse {
    id: number;
    document_type: "aadhar" | "pan" | "gst" | "bank";
    document_number: string;
    document_url: string;
    status: "pending" | "approved" | "rejected";
    reason: string;
    created_at: Date;
    updated_at: Date;
}

export interface DocumentsListResponse {
    success: boolean;
    data: DocumentResponse[];
}

export interface DocumentUploadResponse {
    success: boolean;
    message: string;
    data: DocumentResponse;
}

export interface MessageResponse {
    success: boolean;
    message: string;
}
