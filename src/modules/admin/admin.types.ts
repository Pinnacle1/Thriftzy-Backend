// ============================================================================
// ADMIN MODULE - TYPE DEFINITIONS
// ============================================================================
// This file contains all DTOs, interfaces, and type definitions for the
// admin management system.
// 
// Sections:
// - Admin Authentication (login, register, JWT)
// - Store Management (approval, verification)
// - Revenue & Analytics (dashboard stats, store revenue)
// - Payout Management (process payouts, track transactions)
// - Express Request Extension
// - Error Types
// ============================================================================

// ============== ADMIN AUTHENTICATION ==============

/**
 * DTO for admin login request
 */
export interface AdminLoginRequest {
    email: string;
    password: string;
}

/**
 * DTO for admin registration request
 */
export interface AdminRegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "super_admin";
}

/**
 * Standard response for admin authentication operations
 */
export interface AdminAuthResponse {
    success: boolean;
    message: string;
    data?: {
        admin: AdminResponse;
        tokens: AdminTokenPair;
    };
}

/**
 * Admin JWT token pair
 */
export interface AdminTokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Admin user response DTO
 */
export interface AdminResponse {
    id: number;
    name: string;
    email: string;
    role: "admin" | "super_admin";
    is_active: boolean;
    created_at: Date;
}

/**
 * Admin JWT payload structure
 */
export interface AdminJwtPayload {
    adminId: number;
    email: string;
    role: "admin" | "super_admin";
    type: "access" | "refresh";
    iat?: number;
    exp?: number;
}

// ============== STORE MANAGEMENT ==============

/**
 * Store response with seller details for admin view
 */
export interface StoreWithSellerResponse {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    rating_avg: number;
    rating_count: number;
    is_active: boolean;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
    seller: {
        id: number;
        user_id: number;
        kyc_verified: boolean;
        seller_status: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
    };
    total_products: number;
    total_orders: number;
    total_revenue: number;
}

/**
 * Query parameters for filtering stores
 */
export interface StoreQueryParams {
    status?: "pending" | "verified";
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * DTO for updating store verification status
 */
export interface UpdateStoreStatusRequest {
    is_verified: boolean;
    is_active?: boolean;
}

// ============== REVENUE & ANALYTICS ==============

/**
 * Dashboard statistics for admin overview
 */
export interface DashboardStats {
    total_revenue: number;
    total_commission: number;
    total_orders: number;
    total_stores: number;
    pending_stores: number;
    verified_stores: number;
    total_sellers: number;
    total_buyers: number;
    pending_payouts: number;
    open_tickets: number;
}

/**
 * Revenue breakdown by store
 */
export interface StoreRevenueResponse {
    store_id: number;
    store_name: string;
    total_orders: number;
    total_revenue: number;
    admin_commission: number;
    seller_earnings: number;
}

/**
 * Query parameters for revenue filtering
 */
export interface RevenueQueryParams {
    start_date?: Date;
    end_date?: Date;
    store_id?: number;
}

// ============== PROFIT & COMMISSION ==============

/**
 * Admin profit response (commission earned per product)
 */
export interface AdminProfitResponse {
    total_profit: number;
    total_orders: number;
    total_products_sold: number;
    average_commission_per_product: number;
    commission_rate: number;
}

/**
 * Profit breakdown by store (commission is 5% per product)
 */
export interface StoreProfitResponse {
    store_id: number;
    store_name: string;
    total_orders: number;
    total_products_sold: number;
    total_revenue: number;
    profit: number;
    commission_rate: number;
}

/**
 * Commission settings response
 */
export interface CommissionSettingsResponse {
    id: number;
    commission_rate: number;
    commission_percentage: number;
    updated_by?: number;
    update_note?: string;
    updated_at: Date;
}

/**
 * DTO for updating commission rate
 */
export interface UpdateCommissionRateRequest {
    commission_rate: number;
    update_note?: string;
}

// ============== PAYOUT MANAGEMENT ==============

/**
 * Payout request response with seller and bank details
 */
export interface PayoutRequestResponse {
    id: number;
    seller_id: number;
    store_id?: number;
    amount: number;
    commission_amount: number;
    net_amount: number;
    status: string;
    request_notes?: string;
    admin_notes?: string;
    processed_by?: number;
    processed_at?: Date;
    created_at: Date;
    updated_at: Date;
    seller_profile: {
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        bank_details?: {
            account_holder_name: string;
            account_number_masked: string;
            bank_name: string;
            ifsc_code: string;
        };
    };
}

/**
 * DTO for processing payout requests
 */
export interface ProcessPayoutRequest {
    status: "approved" | "rejected";
    admin_notes?: string;
    transaction_id?: string;
}

/**
 * Query parameters for filtering payouts
 */
export interface PayoutQueryParams {
    status?: "pending" | "requested" | "approved" | "rejected" | "completed" | "failed";
    seller_id?: number;
    page?: number;
    limit?: number;
}

// ============== EXPRESS REQUEST EXTENSION ==============

/**
 * Extend Express Request to include admin properties
 */
declare global {
    namespace Express {
        interface Request {
            admin?: AdminJwtPayload;
            adminId?: number;
        }
    }
}

// ============== ERROR TYPES ==============

/**
 * Base admin error class
 */
export class AdminError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = "AdminError";
        this.statusCode = statusCode;
    }
}

/**
 * Error for unauthorized admin access (401)
 */
export class AdminUnauthorizedError extends AdminError {
    constructor(message: string = "Admin unauthorized") {
        super(message, 401);
        this.name = "AdminUnauthorizedError";
    }
}

/**
 * Error for forbidden admin actions (403)
 */
export class AdminForbiddenError extends AdminError {
    constructor(message: string = "Admin access forbidden") {
        super(message, 403);
        this.name = "AdminForbiddenError";
    }
}
