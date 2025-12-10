import { Repository, DataSource } from "typeorm";
import { Order } from "./order.entity";
import { OrderItem } from "./orderItem.entity";
import { Product } from "../products/product.entity";
import { Cart } from "../carts/cart.entity";
import { CartItem } from "../carts/cartItems.entity";
import { Address } from "../addresses/addresses.entity";
import { AppDataSource } from "../../db/data-source";
import {
    CreateOrderFromCartRequest,
    CreateSingleItemOrderRequest,
    CreateDirectOrderRequest,
    OrderResponse,
    OrderItemResponse,
    OrderQueryParams,
    StoreOrderGroup
} from "./order.types";
import { NotFoundError, ValidationError } from "../auth/auth.types";

export class OrderService {
    private orderRepository: Repository<Order>;
    private orderItemRepository: Repository<OrderItem>;
    private productRepository: Repository<Product>;
    private cartRepository: Repository<Cart>;
    private cartItemRepository: Repository<CartItem>;
    private addressRepository: Repository<Address>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.orderItemRepository = AppDataSource.getRepository(OrderItem);
        this.productRepository = AppDataSource.getRepository(Product);
        this.cartRepository = AppDataSource.getRepository(Cart);
        this.cartItemRepository = AppDataSource.getRepository(CartItem);
        this.addressRepository = AppDataSource.getRepository(Address);
    }

    // ============== GET USER ORDERS ==============

    async getUserOrders(userId: number, params: OrderQueryParams = {}): Promise<{
        orders: OrderResponse[];
        total: number;
        page: number;
        limit: number;
    }> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 10, 50);
        const skip = (page - 1) * limit;

        const queryBuilder = this.orderRepository
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.store", "store")
            .leftJoinAndSelect("order.items", "items")
            .leftJoinAndSelect("items.product", "product")
            .leftJoinAndSelect("product.images", "images")
            .leftJoinAndSelect("order.address", "address")
            .where("order.user_id = :userId", { userId });

        if (params.status) {
            queryBuilder.andWhere("order.status = :status", { status: params.status });
        }

        const [orders, total] = await queryBuilder
            .orderBy("order.created_at", "DESC")
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            orders: orders.map(o => this.toOrderResponse(o)),
            total,
            page,
            limit
        };
    }

    // ============== GET ORDER BY ID ==============

    async getOrderById(userId: number, orderId: number): Promise<OrderResponse> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId, user_id: userId },
            relations: ["store", "items", "items.product", "items.product.images", "address"]
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        return this.toOrderResponse(order);
    }

    // ============== CREATE ORDER FROM CART ==============

    async createOrderFromCart(userId: number, data: CreateOrderFromCartRequest): Promise<{
        orders: OrderResponse[];
        total_orders: number;
        total_amount: number;
    }> {
        // Verify address
        const address = await this.addressRepository.findOne({
            where: { id: data.address_id, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        // Get cart with items
        const cart = await this.cartRepository.findOne({
            where: { user_id: userId },
            relations: ["items", "items.product", "items.product.store", "items.product.images"]
        });

        if (!cart || !cart.items?.length) {
            throw new ValidationError("Your cart is empty");
        }

        // Validate all items and group by store
        const storeGroups = await this.groupItemsByStore(cart.items);

        if (storeGroups.length === 0) {
            throw new ValidationError("No valid items in cart");
        }

        // Create orders for each store
        const createdOrders: Order[] = [];
        let totalAmount = 0;

        for (const group of storeGroups) {
            const order = await this.createSingleStoreOrder(userId, data.address_id, group);
            createdOrders.push(order);
            totalAmount += order.total_amount;
        }

        // Clear cart after successful order
        await this.cartItemRepository.delete({ cart_id: cart.id });

        // Reload orders with full relations
        const fullOrders = await Promise.all(
            createdOrders.map(o => this.orderRepository.findOne({
                where: { id: o.id },
                relations: ["store", "items", "items.product", "items.product.images", "address"]
            }))
        );

        return {
            orders: fullOrders.filter(o => o !== null).map(o => this.toOrderResponse(o!)),
            total_orders: createdOrders.length,
            total_amount: totalAmount
        };
    }

    // ============== CREATE SINGLE ITEM ORDER ==============

    async createSingleItemOrder(userId: number, data: CreateSingleItemOrderRequest): Promise<{
        orders: OrderResponse[];
        total_orders: number;
        total_amount: number;
    }> {
        // Verify address
        const address = await this.addressRepository.findOne({
            where: { id: data.address_id, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        // Get product
        const product = await this.productRepository.findOne({
            where: { id: data.product_id },
            relations: ["store", "images"]
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        if (!product.store?.is_active) {
            throw new ValidationError("This product is not available");
        }

        if (product.quantity < data.quantity) {
            throw new ValidationError(`Only ${product.quantity} items available`);
        }

        // Create order
        const storeGroup: StoreOrderGroup = {
            store_id: product.store_id,
            items: [{
                product_id: product.id,
                quantity: data.quantity,
                price: product.price,
                title: product.title
            }],
            subtotal: product.price * data.quantity
        };

        const order = await this.createSingleStoreOrder(userId, data.address_id, storeGroup);

        // Reload order with full relations
        const fullOrder = await this.orderRepository.findOne({
            where: { id: order.id },
            relations: ["store", "items", "items.product", "items.product.images", "address"]
        });

        return {
            orders: [this.toOrderResponse(fullOrder!)],
            total_orders: 1,
            total_amount: order.total_amount
        };
    }

    // ============== CREATE DIRECT ORDER (Multiple Items) ==============

    async createDirectOrder(userId: number, data: CreateDirectOrderRequest): Promise<{
        orders: OrderResponse[];
        total_orders: number;
        total_amount: number;
    }> {
        // Verify address
        const address = await this.addressRepository.findOne({
            where: { id: data.address_id, user_id: userId }
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        if (!data.items?.length) {
            throw new ValidationError("No items provided");
        }

        // Get all products
        const productIds = data.items.map(i => i.product_id);
        const products = await this.productRepository.find({
            where: productIds.map(id => ({ id })),
            relations: ["store", "images"]
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        // Validate and group by store
        const storeGroupsMap = new Map<number, StoreOrderGroup>();

        for (const item of data.items) {
            const product = productMap.get(item.product_id);

            if (!product) {
                throw new NotFoundError(`Product ${item.product_id} not found`);
            }

            if (!product.store?.is_active) {
                throw new ValidationError(`Product "${product.title}" is not available`);
            }

            if (product.quantity < item.quantity) {
                throw new ValidationError(`Only ${product.quantity} of "${product.title}" available`);
            }

            let group = storeGroupsMap.get(product.store_id);
            if (!group) {
                group = {
                    store_id: product.store_id,
                    items: [],
                    subtotal: 0
                };
                storeGroupsMap.set(product.store_id, group);
            }

            group.items.push({
                product_id: product.id,
                quantity: item.quantity,
                price: product.price,
                title: product.title
            });
            group.subtotal += product.price * item.quantity;
        }

        // Create orders for each store
        const createdOrders: Order[] = [];
        let totalAmount = 0;

        for (const group of storeGroupsMap.values()) {
            const order = await this.createSingleStoreOrder(userId, data.address_id, group);
            createdOrders.push(order);
            totalAmount += order.total_amount;
        }

        // Reload orders with full relations
        const fullOrders = await Promise.all(
            createdOrders.map(o => this.orderRepository.findOne({
                where: { id: o.id },
                relations: ["store", "items", "items.product", "items.product.images", "address"]
            }))
        );

        return {
            orders: fullOrders.filter(o => o !== null).map(o => this.toOrderResponse(o!)),
            total_orders: createdOrders.length,
            total_amount: totalAmount
        };
    }

    // ============== CANCEL ORDER ==============

    async cancelOrder(userId: number, orderId: number): Promise<OrderResponse> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId, user_id: userId },
            relations: ["store", "items", "items.product", "items.product.images", "address"]
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        if (order.status !== "pending") {
            throw new ValidationError("Only pending orders can be cancelled");
        }

        // Restore product quantities
        for (const item of order.items) {
            await this.productRepository.increment(
                { id: item.product_id },
                "quantity",
                item.quantity
            );
        }

        order.status = "cancelled";
        await this.orderRepository.save(order);

        return this.toOrderResponse(order);
    }

    // ============== GET ORDER SUMMARY (Before Checkout) ==============

    async getOrderSummary(userId: number, type: "cart" | "items", items?: { product_id: number; quantity: number }[]): Promise<{
        subtotal: number;
        shipping_fee: number;
        discount: number;
        total: number;
        stores_count: number;
        items_count: number;
    }> {
        let cartItems: { product_id: number; quantity: number; price: number }[] = [];

        if (type === "cart") {
            const cart = await this.cartRepository.findOne({
                where: { user_id: userId },
                relations: ["items", "items.product", "items.product.store"]
            });

            if (!cart || !cart.items?.length) {
                return {
                    subtotal: 0,
                    shipping_fee: 0,
                    discount: 0,
                    total: 0,
                    stores_count: 0,
                    items_count: 0
                };
            }

            cartItems = cart.items
                .filter(i => i.product && i.product.store?.is_active && i.product.quantity > 0)
                .map(i => ({
                    product_id: i.product_id,
                    quantity: Math.min(i.quantity, i.product.quantity),
                    price: i.product.price
                }));
        } else if (items?.length) {
            const productIds = items.map(i => i.product_id);
            const products = await this.productRepository.find({
                where: productIds.map(id => ({ id })),
                relations: ["store"]
            });

            const productMap = new Map(products.map(p => [p.id, p]));

            cartItems = items
                .filter(i => {
                    const product = productMap.get(i.product_id);
                    return product && product.store?.is_active && product.quantity > 0;
                })
                .map(i => {
                    const product = productMap.get(i.product_id)!;
                    return {
                        product_id: i.product_id,
                        quantity: Math.min(i.quantity, product.quantity),
                        price: product.price
                    };
                });
        }

        const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const storeIds = new Set(cartItems.map(i => i.product_id)); // Simplified
        const shipping_fee = 0; // Can be calculated based on store count
        const discount = 0;

        return {
            subtotal,
            shipping_fee,
            discount,
            total: subtotal + shipping_fee - discount,
            stores_count: storeIds.size,
            items_count: cartItems.reduce((sum, i) => sum + i.quantity, 0)
        };
    }

    // ============== HELPER METHODS ==============

    private async groupItemsByStore(cartItems: CartItem[]): Promise<StoreOrderGroup[]> {
        const storeGroupsMap = new Map<number, StoreOrderGroup>();

        for (const item of cartItems) {
            const product = item.product;

            // Skip invalid items
            if (!product || !product.store?.is_active || product.quantity < 1) {
                continue;
            }

            // Adjust quantity if exceeds stock
            const quantity = Math.min(item.quantity, product.quantity);

            let group = storeGroupsMap.get(product.store_id);
            if (!group) {
                group = {
                    store_id: product.store_id,
                    items: [],
                    subtotal: 0
                };
                storeGroupsMap.set(product.store_id, group);
            }

            group.items.push({
                product_id: product.id,
                quantity,
                price: product.price,
                title: product.title
            });
            group.subtotal += product.price * quantity;
        }

        return Array.from(storeGroupsMap.values());
    }

    private async createSingleStoreOrder(
        userId: number,
        addressId: number,
        group: StoreOrderGroup
    ): Promise<Order> {
        // Create order
        const order = this.orderRepository.create({
            user_id: userId,
            store_id: group.store_id,
            address_id: addressId,
            status: "pending",
            total_amount: group.subtotal
        });

        await this.orderRepository.save(order);

        // Create order items and reduce stock
        for (const item of group.items) {
            const orderItem = this.orderItemRepository.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: item.price,
                title: item.title
            });

            await this.orderItemRepository.save(orderItem);

            // Reduce product stock
            await this.productRepository.decrement(
                { id: item.product_id },
                "quantity",
                item.quantity
            );
        }

        return order;
    }

    private toOrderResponse(order: Order): OrderResponse {
        const items = (order.items || []).map(item => {
            // Get thumbnail
            const sortedImages = (item.product?.images || []).sort((a, b) => a.position - b.position);
            const thumbnail = sortedImages.length > 0 ? sortedImages[0].image_url : null;

            return {
                id: item.id,
                product_id: item.product_id,
                title: item.title,
                quantity: item.quantity,
                price_at_purchase: item.price_at_purchase,
                item_total: item.price_at_purchase * item.quantity,
                thumbnail
            } as OrderItemResponse;
        });

        const subtotal = items.reduce((sum, i) => sum + i.item_total, 0);

        return {
            id: order.id,
            store: {
                id: order.store?.id || order.store_id,
                name: order.store?.name || "Unknown Store",
                slug: order.store?.slug || ""
            },
            status: order.status,
            items,
            shipping_address: order.address ? {
                id: order.address.id,
                name: order.address.name,
                phone: order.address.phone,
                line1: order.address.line1,
                line2: order.address.line2 || "",
                city: order.address.city,
                state: order.address.state,
                country: order.address.country,
                pincode: order.address.pincode
            } : {
                id: 0,
                name: "",
                phone: "",
                line1: "",
                line2: "",
                city: "",
                state: "",
                country: "",
                pincode: ""
            },
            subtotal,
            shipping_fee: 0,
            total_amount: order.total_amount,
            created_at: order.created_at,
            updated_at: order.updated_at
        };
    }
}

// Export singleton instance
export const orderService = new OrderService();
