// ============== Request DTOs ==============

export interface CreateStoreRequest {
    name: string;
    slug?: string;
    description: string;
    logo_url?: string;
}

export interface UpdateStoreRequest {
    name?: string;
    description?: string;
    logo_url?: string;
    is_active?: boolean;
}

export interface CreateProductRequest {
    store_id: number;
    title: string;
    description: string;
    category: string;
    condition: "new" | "good" | "fair";
    price: number;
    quantity: number;
    images?: string[];
    attributes?: { name: string; value: string }[];
}

export interface UpdateProductRequest {
    title?: string;
    description?: string;
    category?: string;
    condition?: "new" | "good" | "fair";
    price?: number;
    quantity?: number;
    is_active?: boolean;
}

export interface UpdateOrderStatusRequest {
    status: "shipped" | "delivered" | "cancelled";
    tracking_number?: string;
    notes?: string;
}

// ============== Response DTOs ==============

export interface SellerDashboardResponse {
    success: boolean;
    data: {
        profile: SellerProfileData;
        stats: SellerStats;
    };
}

export interface SellerProfileData {
    id: number;
    user_id: number;
    kyc_verified: boolean;
    gst_number: string;
    seller_status: "pending" | "approved" | "rejected";
    created_at: Date;
}

export interface SellerStats {
    total_stores: number;
    total_products: number;
    total_orders: number;
    pending_orders: number;
    total_revenue: number;
    pending_payouts: number;
}

export interface StoreResponse {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    rating_avg: number;
    rating_count: number;
    is_active: boolean;
    is_verified: boolean;
    products_count?: number;
    created_at: Date;
}

export interface ProductResponse {
    id: number;
    store_id: number;
    title: string;
    description: string;
    category: string;
    condition: "new" | "good" | "fair";
    price: number;
    quantity: number;
    images: ProductImageResponse[];
    attributes: ProductAttributeResponse[];
    created_at: Date;
    updated_at: Date;
}

export interface ProductImageResponse {
    id: number;
    image_url: string;
    position: number;
}

export interface ProductAttributeResponse {
    id: number;
    name: string;
    value: string;
}

export interface SellerOrderResponse {
    id: number;
    user_name: string;
    user_email: string;
    status: string;
    total_amount: number;
    items: SellerOrderItemResponse[];
    shipping_address: AddressResponse | null;
    created_at: Date;
}

export interface SellerOrderItemResponse {
    id: number;
    product_id: number;
    product_title: string;
    quantity: number;
    price_at_purchase: number;
}

export interface AddressResponse {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

export interface PayoutResponse {
    id: number;
    amount: number;
    status: "pending" | "completed" | "failed";
    reason: string | null;
    created_at: Date;
}

// ============== Pagination ==============

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export interface ProductFilters extends PaginationOptions {
    store_id?: number;
    category?: string;
    condition?: "new" | "good" | "fair";
}

export interface OrderFilters extends PaginationOptions {
    store_id?: number;
    status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}

export interface PayoutFilters extends PaginationOptions {
    status?: "pending" | "completed" | "failed";
}
