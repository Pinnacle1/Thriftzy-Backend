// ============== Query Parameters ==============

export interface ProductSearchParams {
    query?: string;
    category?: string;
    condition?: "new" | "good" | "fair";
    min_price?: number;
    max_price?: number;
    store_id?: number;
    sort_by?: "price_asc" | "price_desc" | "newest" | "popular";
    page?: number;
    limit?: number;
}

export interface CategoryParams {
    parent?: string;
}

// ============== Response DTOs ==============

export interface ProductListResponse {
    success: boolean;
    data: {
        products: ProductCard[];
        total: number;
        page: number;
        limit: number;
        filters: AvailableFilters;
    };
}

export interface ProductCard {
    id: number;
    title: string;
    price: number;
    condition: "new" | "good" | "fair";
    category: string;
    thumbnail: string | null;
    store: {
        id: number;
        name: string;
        slug: string;
    };
    rating_avg: number;
    rating_count: number;
    created_at: Date;
}

export interface ProductDetailResponse {
    success: boolean;
    data: ProductDetail;
}

export interface ProductDetail {
    id: number;
    title: string;
    description: string;
    price: number;
    quantity: number;
    condition: "new" | "good" | "fair";
    category: string;
    images: ProductImageData[];
    attributes: ProductAttributeData[];
    store: StoreInfo;
    rating_avg: number;
    rating_count: number;
    reviews: ReviewSummary[];
    related_products: ProductCard[];
    created_at: Date;
    updated_at: Date;
}

export interface ProductImageData {
    id: number;
    image_url: string;
    position: number;
}

export interface ProductAttributeData {
    id: number;
    name: string;
    value: string;
}

export interface StoreInfo {
    id: number;
    name: string;
    slug: string;
    logo_url: string;
    rating_avg: number;
    rating_count: number;
    is_verified: boolean;
    products_count: number;
}

export interface ReviewSummary {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: Date;
}

export interface AvailableFilters {
    categories: string[];
    conditions: string[];
    price_range: {
        min: number;
        max: number;
    };
}

export interface CategoryResponse {
    name: string;
    slug: string;
    product_count: number;
}
