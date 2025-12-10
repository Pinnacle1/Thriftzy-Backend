import { Repository } from "typeorm";
import { Product } from "./product.entity";
import { Store } from "../stores/store.entity";
import { Review } from "../reviews/review.entity";
import { AppDataSource } from "../../db/data-source";
import {
    ProductSearchParams,
    ProductCard,
    ProductDetail,
    AvailableFilters,
    CategoryResponse
} from "./product.types";
import { NotFoundError } from "../auth/auth.types";

export class ProductService {
    private productRepository: Repository<Product>;
    private storeRepository: Repository<Store>;
    private reviewRepository: Repository<Review>;

    constructor() {
        this.productRepository = AppDataSource.getRepository(Product);
        this.storeRepository = AppDataSource.getRepository(Store);
        this.reviewRepository = AppDataSource.getRepository(Review);
    }

    // ============== GET PRODUCTS (Search & Browse) ==============

    async getProducts(params: ProductSearchParams = {}): Promise<{
        products: ProductCard[];
        total: number;
        page: number;
        limit: number;
        filters: AvailableFilters;
    }> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 20, 50); // Max 50 per page
        const skip = (page - 1) * limit;

        const queryBuilder = this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.store", "store")
            .leftJoinAndSelect("product.images", "images")
            .leftJoinAndSelect("product.reviews", "reviews")
            .where("product.quantity > 0") // Only in-stock products
            .andWhere("store.is_active = :isActive", { isActive: true }); // Only from active stores

        // Apply search query
        if (params.query) {
            queryBuilder.andWhere(
                "(product.title ILIKE :query OR product.description ILIKE :query)",
                { query: `%${params.query}%` }
            );
        }

        // Apply filters
        if (params.category) {
            queryBuilder.andWhere("product.category = :category", { category: params.category });
        }

        if (params.condition) {
            queryBuilder.andWhere("product.condition = :condition", { condition: params.condition });
        }

        if (params.min_price !== undefined) {
            queryBuilder.andWhere("product.price >= :minPrice", { minPrice: params.min_price });
        }

        if (params.max_price !== undefined) {
            queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice: params.max_price });
        }

        if (params.store_id) {
            queryBuilder.andWhere("product.store_id = :storeId", { storeId: params.store_id });
        }

        // Apply sorting
        switch (params.sort_by) {
            case "price_asc":
                queryBuilder.orderBy("product.price", "ASC");
                break;
            case "price_desc":
                queryBuilder.orderBy("product.price", "DESC");
                break;
            case "popular":
                // Sort by review count (most reviewed first)
                queryBuilder.orderBy("(SELECT COUNT(*) FROM reviews WHERE reviews.product_id = product.id)", "DESC");
                break;
            case "newest":
            default:
                queryBuilder.orderBy("product.created_at", "DESC");
                break;
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const products = await queryBuilder
            .skip(skip)
            .take(limit)
            .getMany();

        // Get available filters
        const filters = await this.getAvailableFilters();

        return {
            products: products.map(p => this.toProductCard(p)),
            total,
            page,
            limit,
            filters
        };
    }

    // ============== GET PRODUCT BY ID ==============

    async getProductById(productId: number): Promise<ProductDetail> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ["store", "images", "attributes", "reviews", "reviews.user"]
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        // Check if store is active
        if (!product.store?.is_active) {
            throw new NotFoundError("Product not found");
        }

        // Get related products (same category, excluding current)
        const relatedProducts = await this.productRepository.find({
            where: { category: product.category },
            relations: ["store", "images", "reviews"],
            take: 6
        });

        const filteredRelated = relatedProducts
            .filter(p => p.id !== productId && p.store?.is_active)
            .slice(0, 4);

        // Get products count for store
        const storeProductsCount = await this.productRepository.count({
            where: { store_id: product.store_id }
        });

        return this.toProductDetail(product, filteredRelated, storeProductsCount);
    }

    // ============== GET PRODUCTS BY CATEGORY ==============

    async getProductsByCategory(category: string, params: ProductSearchParams = {}): Promise<{
        products: ProductCard[];
        total: number;
        page: number;
        limit: number;
    }> {
        const result = await this.getProducts({
            ...params,
            category
        });

        return {
            products: result.products,
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }

    // ============== GET PRODUCTS BY STORE ==============

    async getProductsByStore(storeId: number, params: ProductSearchParams = {}): Promise<{
        products: ProductCard[];
        total: number;
        page: number;
        limit: number;
        store: { id: number; name: string; slug: string; logo_url: string } | null;
    }> {
        // First check if store exists and is active
        const store = await this.storeRepository.findOne({
            where: { id: storeId, is_active: true }
        });

        if (!store) {
            throw new NotFoundError("Store not found");
        }

        const result = await this.getProducts({
            ...params,
            store_id: storeId
        });

        return {
            products: result.products,
            total: result.total,
            page: result.page,
            limit: result.limit,
            store: {
                id: store.id,
                name: store.name,
                slug: store.slug,
                logo_url: store.logo_url
            }
        };
    }

    // ============== GET FEATURED PRODUCTS ==============

    async getFeaturedProducts(limit: number = 8): Promise<ProductCard[]> {
        // Get products with highest ratings and reviews
        const products = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.store", "store")
            .leftJoinAndSelect("product.images", "images")
            .leftJoinAndSelect("product.reviews", "reviews")
            .where("product.quantity > 0")
            .andWhere("store.is_active = :isActive", { isActive: true })
            .orderBy("store.rating_avg", "DESC")
            .addOrderBy("product.created_at", "DESC")
            .take(limit)
            .getMany();

        return products.map(p => this.toProductCard(p));
    }

    // ============== GET NEW ARRIVALS ==============

    async getNewArrivals(limit: number = 8): Promise<ProductCard[]> {
        const products = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.store", "store")
            .leftJoinAndSelect("product.images", "images")
            .leftJoinAndSelect("product.reviews", "reviews")
            .where("product.quantity > 0")
            .andWhere("store.is_active = :isActive", { isActive: true })
            .orderBy("product.created_at", "DESC")
            .take(limit)
            .getMany();

        return products.map(p => this.toProductCard(p));
    }

    // ============== GET CATEGORIES ==============

    async getCategories(): Promise<CategoryResponse[]> {
        const categories = await this.productRepository
            .createQueryBuilder("product")
            .leftJoin("product.store", "store")
            .select("product.category", "name")
            .addSelect("COUNT(product.id)", "product_count")
            .where("product.quantity > 0")
            .andWhere("store.is_active = :isActive", { isActive: true })
            .groupBy("product.category")
            .orderBy("product_count", "DESC")
            .getRawMany();

        return categories.map(cat => ({
            name: cat.name,
            slug: this.slugify(cat.name),
            product_count: parseInt(cat.product_count, 10)
        }));
    }

    // ============== SEARCH SUGGESTIONS ==============

    async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
        if (!query || query.length < 2) {
            return [];
        }

        const products = await this.productRepository
            .createQueryBuilder("product")
            .leftJoin("product.store", "store")
            .select("DISTINCT product.title", "title")
            .where("product.title ILIKE :query", { query: `%${query}%` })
            .andWhere("store.is_active = :isActive", { isActive: true })
            .take(limit)
            .getRawMany();

        return products.map(p => p.title);
    }

    // ============== HELPER METHODS ==============

    private async getAvailableFilters(): Promise<AvailableFilters> {
        // Get all categories
        const categories = await this.productRepository
            .createQueryBuilder("product")
            .leftJoin("product.store", "store")
            .select("DISTINCT product.category", "category")
            .where("store.is_active = :isActive", { isActive: true })
            .getRawMany();

        // Get price range
        const priceRange = await this.productRepository
            .createQueryBuilder("product")
            .leftJoin("product.store", "store")
            .select("MIN(product.price)", "min")
            .addSelect("MAX(product.price)", "max")
            .where("store.is_active = :isActive", { isActive: true })
            .getRawOne();

        return {
            categories: categories.map(c => c.category),
            conditions: ["new", "good", "fair"],
            price_range: {
                min: parseFloat(priceRange?.min || "0"),
                max: parseFloat(priceRange?.max || "10000")
            }
        };
    }

    private toProductCard(product: Product): ProductCard {
        const reviews = product.reviews || [];
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Get first image as thumbnail
        const sortedImages = (product.images || []).sort((a, b) => a.position - b.position);
        const thumbnail = sortedImages.length > 0 ? sortedImages[0].image_url : null;

        return {
            id: product.id,
            title: product.title,
            price: product.price,
            condition: product.condition,
            category: product.category,
            thumbnail,
            store: {
                id: product.store?.id || 0,
                name: product.store?.name || "Unknown",
                slug: product.store?.slug || ""
            },
            rating_avg: Math.round(avgRating * 10) / 10,
            rating_count: reviews.length,
            created_at: product.created_at
        };
    }

    private toProductDetail(
        product: Product,
        relatedProducts: Product[],
        storeProductsCount: number
    ): ProductDetail {
        const reviews = product.reviews || [];
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            condition: product.condition,
            category: product.category,
            images: (product.images || [])
                .sort((a, b) => a.position - b.position)
                .map(img => ({
                    id: img.id,
                    image_url: img.image_url,
                    position: img.position
                })),
            attributes: (product.attributes || []).map(attr => ({
                id: attr.id,
                name: attr.name,
                value: attr.value
            })),
            store: {
                id: product.store?.id || 0,
                name: product.store?.name || "Unknown",
                slug: product.store?.slug || "",
                logo_url: product.store?.logo_url || "",
                rating_avg: product.store?.rating_avg || 0,
                rating_count: product.store?.rating_count || 0,
                is_verified: product.store?.is_verified || false,
                products_count: storeProductsCount
            },
            rating_avg: Math.round(avgRating * 10) / 10,
            rating_count: reviews.length,
            reviews: reviews.slice(0, 5).map(review => ({
                id: review.id,
                user_name: review.user?.name || "Anonymous",
                rating: review.rating,
                comment: review.description,
                created_at: review.created_at
            })),
            related_products: relatedProducts.map(p => this.toProductCard(p)),
            created_at: product.created_at,
            updated_at: product.updated_at
        };
    }

    private slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }
}

// Export singleton instance
export const productService = new ProductService();
