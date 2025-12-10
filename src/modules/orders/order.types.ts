// ============== Request DTOs ==============

export interface CreateOrderFromCartRequest {
    address_id: number;
    payment_method?: string;
}

export interface CreateSingleItemOrderRequest {
    product_id: number;
    quantity: number;
    address_id: number;
    payment_method?: string;
}

export interface CreateDirectOrderRequest {
    items: {
        product_id: number;
        quantity: number;
    }[];
    address_id: number;
    payment_method?: string;
}

// ============== Response DTOs ==============

export interface OrderResponse {
    id: number;
    store: {
        id: number;
        name: string;
        slug: string;
    };
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    items: OrderItemResponse[];
    shipping_address: AddressInfo;
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    created_at: Date;
    updated_at: Date;
}

export interface OrderItemResponse {
    id: number;
    product_id: number;
    title: string;
    quantity: number;
    price_at_purchase: number;
    item_total: number;
    thumbnail: string | null;
}

export interface AddressInfo {
    id: number;
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

export interface OrderListResponse {
    orders: OrderResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: {
        orders: OrderResponse[];
        total_orders: number;
        total_amount: number;
    };
}

export interface OrderSummaryResponse {
    subtotal: number;
    shipping_fee: number;
    discount: number;
    total: number;
    stores_count: number;
}

// ============== Query Params ==============

export interface OrderQueryParams {
    status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    page?: number;
    limit?: number;
}

// ============== Internal Types ==============

export interface StoreOrderGroup {
    store_id: number;
    items: {
        product_id: number;
        quantity: number;
        price: number;
        title: string;
    }[];
    subtotal: number;
}
