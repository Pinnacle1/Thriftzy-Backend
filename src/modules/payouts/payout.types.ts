// ============== REQUEST DTOs ==============

export interface CreatePayoutRequestDto {
    store_id?: number;
    order_ids?: number[];
    request_notes?: string;
}

// ============== RESPONSE DTOs ==============

export interface SellerPayoutResponse {
    id: number;
    store_id?: number;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    status: string;
    request_notes?: string;
    admin_notes?: string;
    transaction_id?: string;
    processed_at?: Date;
    created_at: Date;
    updated_at: Date;
    store?: {
        id: number;
        name: string;
    };
}

export interface SellerEarningsResponse {
    total_orders: number;
    total_revenue: number;
    total_commission: number;
    net_earnings: number;
    pending_payout: number;
    completed_payouts: number;
    available_for_payout: number;
}

export interface PayoutSummaryByStore {
    store_id: number;
    store_name: string;
    total_orders: number;
    total_revenue: number;
    total_commission: number;
    net_earnings: number;
    pending_payout: number;
    available_for_payout: number;
}

// ============== QUERY PARAMS ==============

export interface PayoutQueryParams {
    status?: "pending" | "requested" | "approved" | "completed" | "rejected" | "failed";
    page?: number;
    limit?: number;
}
