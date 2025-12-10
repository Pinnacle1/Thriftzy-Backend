import { User } from "./user.entity";

// ============== Request DTOs ==============

export interface UpdateProfileRequest {
    name?: string;
}

export interface UpdateEmailRequest {
    newEmail: string;
    otp: string;
}

export interface UpdatePhoneRequest {
    newPhone: string;
    otp: string;
}

export interface SendUpdateOtpRequest {
    type: "email" | "phone";
    newValue: string;
}

export interface AttachCartRequest {
    guestCartId: number;
}

// ============== Response DTOs ==============

export interface UserProfileResponse {
    success: boolean;
    data: UserProfile;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: "buyer" | "seller";
    email_verified: boolean;
    phone_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserWithSellerProfile extends UserProfile {
    seller_profile: SellerProfileSummary | null;
}

export interface SellerProfileSummary {
    id: number;
    kyc_verified: boolean;
    gst_number: string;
    seller_status: "pending" | "approved" | "rejected";
    stores: StoreSummary[];
    documents: DocumentSummary[];
    created_at: Date;
}

export interface StoreSummary {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    is_verified: boolean;
    rating_avg: number;
    rating_count: number;
}

export interface DocumentSummary {
    id: number;
    document_type: "aadhar" | "pan" | "gst" | "bank";
    status: "pending" | "approved" | "rejected";
}

export interface UserOrdersResponse {
    success: boolean;
    data: {
        orders: OrderSummary[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface OrderSummary {
    id: number;
    status: string;
    total_amount: number;
    items_count: number;
    store_name: string;
    created_at: Date;
}

export interface AttachCartResponse {
    success: boolean;
    message: string;
    data: {
        cart_id: number;
        items_merged: number;
    };
}

export interface MessageResponse {
    success: boolean;
    message: string;
}

// ============== Pagination ==============

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface OrderFilters extends PaginationOptions {
    status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}
