export interface CreateSupportTicketRequest {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    category?: "order" | "payment" | "product" | "shipping" | "account" | "other";
}


export interface UpdateSupportTicketRequest {
    status?: "open" | "in_progress" | "resolved" | "closed";
    priority?: "low" | "medium" | "high" | "urgent";
    admin_response?: string;
}

export interface SupportTicketResponse {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    category: "order" | "payment" | "product" | "shipping" | "account" | "other";
    admin_response?: string;
    resolved_by?: number;
    resolved_at?: Date;
    created_at: Date;
    updated_at: Date;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}


export interface SupportTicketListResponse {
    tickets: SupportTicketResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface SupportTicketQueryParams {
    status?: "open" | "in_progress" | "resolved" | "closed";
    priority?: "low" | "medium" | "high" | "urgent";
    category?: "order" | "payment" | "product" | "shipping" | "account" | "other";
    page?: number;
    limit?: number;
}

export class SupportTicketNotFoundError extends Error {
    public readonly statusCode = 404;

    constructor(message = "Support ticket not found") {
        super(message);
        this.name = "SupportTicketNotFoundError";
    }
}

export class SupportValidationError extends Error {
    public readonly statusCode = 422;

    constructor(message: string) {
        super(message);
        this.name = "SupportValidationError";
    }
}
