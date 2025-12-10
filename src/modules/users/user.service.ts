import { Repository } from "typeorm";
import { User } from "./user.entity";
import { Cart } from "../carts/cart.entity";
import { CartItem } from "../carts/cartItems.entity";
import { Order } from "../orders/order.entity";
import { AppDataSource } from "../../db/data-source";
import {
    UpdateProfileRequest,
    UserProfile,
    UserWithSellerProfile,
    OrderSummary,
    OrderFilters,
    AttachCartResponse
} from "./user.types";
import { NotFoundError, ValidationError } from "../auth/auth.types";
import { validateName, validateEmail, validatePhone } from "../../utils/validator";

export class UserService {
    private userRepository: Repository<User>;
    private cartRepository: Repository<Cart>;
    private cartItemRepository: Repository<CartItem>;
    private orderRepository: Repository<Order>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.cartRepository = AppDataSource.getRepository(Cart);
        this.cartItemRepository = AppDataSource.getRepository(CartItem);
        this.orderRepository = AppDataSource.getRepository(Order);
    }

    // ============== GET ME (Current User Profile) ==============

    async getMe(userId: number): Promise<UserProfile> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return this.toUserProfile(user);
    }

    // ============== GET USER BY ID ==============

    async getUserById(userId: number): Promise<UserProfile> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return this.toUserProfile(user);
    }

    // ============== GET USER WITH SELLER PROFILE ==============

    async getUserWithSellerProfile(userId: number): Promise<UserWithSellerProfile> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["seller_profile", "seller_profile.stores", "seller_profile.documents"]
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return this.toUserWithSellerProfile(user);
    }

    // ============== UPDATE PROFILE ==============

    async updateProfile(userId: number, data: UpdateProfileRequest): Promise<UserProfile> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Update name if provided
        if (data.name !== undefined) {
            validateName(data.name);
            user.name = data.name.trim();
        }

        await this.userRepository.save(user);

        return this.toUserProfile(user);
    }

    // ============== UPDATE EMAIL (with OTP verification) ==============

    async updateEmail(userId: number, newEmail: string, otp: string): Promise<UserProfile> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Validate new email
        validateEmail(newEmail);

        // Check if email is already taken
        const existingUser = await this.userRepository.findOne({
            where: { email: newEmail.toLowerCase() }
        });

        if (existingUser && existingUser.id !== userId) {
            throw new ValidationError("Email is already registered");
        }

        // TODO: Verify OTP
        // For now, we'll skip OTP verification - implement when OTP service is ready
        // await this.verifyOtp(userId, otp, "email_update");

        // Update email
        user.email = newEmail.toLowerCase();
        await this.userRepository.save(user);

        return this.toUserProfile(user);
    }

    // ============== UPDATE PHONE (with OTP verification) ==============

    async updatePhone(userId: number, newPhone: string, otp: string): Promise<UserProfile> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Validate new phone
        validatePhone(newPhone);

        // Check if phone is already taken
        const existingUser = await this.userRepository.findOne({
            where: { phone: newPhone }
        });

        if (existingUser && existingUser.id !== userId) {
            throw new ValidationError("Phone number is already registered");
        }

        // TODO: Verify OTP
        // For now, we'll skip OTP verification - implement when OTP service is ready
        // await this.verifyOtp(userId, otp, "phone_update");

        // Update phone
        user.phone = newPhone;
        await this.userRepository.save(user);

        return this.toUserProfile(user);
    }

    // ============== SEND UPDATE OTP ==============

    async sendUpdateOtp(userId: number, type: "email" | "phone", newValue: string): Promise<{ success: boolean; message: string; expiresIn: number }> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Validate the new value
        if (type === "email") {
            validateEmail(newValue);

            // Check if email is already taken
            const existingUser = await this.userRepository.findOne({
                where: { email: newValue.toLowerCase() }
            });
            if (existingUser && existingUser.id !== userId) {
                throw new ValidationError("Email is already registered");
            }
        } else {
            validatePhone(newValue);

            // Check if phone is already taken
            const existingUser = await this.userRepository.findOne({
                where: { phone: newValue }
            });
            if (existingUser && existingUser.id !== userId) {
                throw new ValidationError("Phone number is already registered");
            }
        }

        // TODO: Generate and send OTP
        // For now, return success - implement when OTP service is ready
        const otpExpiryMinutes = 10;

        // In development, log the OTP
        if (process.env.NODE_ENV === "development") {
            const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[DEV] OTP for ${type} update to ${newValue}: ${mockOtp}`);
        }

        return {
            success: true,
            message: `OTP sent to your new ${type}`,
            expiresIn: otpExpiryMinutes * 60
        };
    }

    // ============== GET USER ORDERS ==============

    async getUserOrders(userId: number, filters: OrderFilters = {}): Promise<{
        orders: OrderSummary[];
        total: number;
        page: number;
        limit: number;
    }> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        // Build query
        const queryBuilder = this.orderRepository
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.items", "items")
            .leftJoinAndSelect("order.store", "store")
            .where("order.user_id = :userId", { userId });

        // Apply status filter if provided
        if (filters.status) {
            queryBuilder.andWhere("order.status = :status", { status: filters.status });
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const orders = await queryBuilder
            .orderBy("order.created_at", "DESC")
            .skip(skip)
            .take(limit)
            .getMany();

        // Transform to OrderSummary
        const orderSummaries: OrderSummary[] = orders.map(order => ({
            id: order.id,
            status: order.status,
            total_amount: order.total_amount,
            items_count: order.items?.length || 0,
            store_name: order.store?.name || "Unknown Store",
            created_at: order.created_at
        }));

        return {
            orders: orderSummaries,
            total,
            page,
            limit
        };
    }

    // ============== ATTACH CART (Merge Guest Cart) ==============

    async attachCart(userId: number, guestCartId: number): Promise<AttachCartResponse> {
        // Get user
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Get guest cart with items
        const guestCart = await this.cartRepository.findOne({
            where: { id: guestCartId },
            relations: ["items", "items.product"]
        });

        if (!guestCart) {
            throw new NotFoundError("Guest cart not found");
        }

        // Don't allow attaching if guest cart belongs to another user
        if (guestCart.user_id && guestCart.user_id !== userId) {
            throw new ValidationError("Cannot attach cart belonging to another user");
        }

        // Get or create user's cart
        let userCart = await this.cartRepository.findOne({
            where: { user_id: userId },
            relations: ["items"]
        });

        if (!userCart) {
            // Create new cart for user
            userCart = this.cartRepository.create({
                user_id: userId
            });
            await this.cartRepository.save(userCart);
            userCart.items = [];
        }

        let itemsMerged = 0;

        // Merge guest cart items into user cart
        if (guestCart.items && guestCart.items.length > 0) {
            for (const guestItem of guestCart.items) {
                // Check if product already exists in user cart
                const existingItem = userCart.items?.find(
                    item => item.product_id === guestItem.product_id
                );

                if (existingItem) {
                    // Update quantity
                    existingItem.quantity += guestItem.quantity;
                    await this.cartItemRepository.save(existingItem);
                } else {
                    // Create new cart item for user cart
                    const newItem = this.cartItemRepository.create({
                        cart_id: userCart.id,
                        product_id: guestItem.product_id,
                        quantity: guestItem.quantity
                    });
                    await this.cartItemRepository.save(newItem);
                }
                itemsMerged++;
            }

            // Delete guest cart items
            await this.cartItemRepository.delete({ cart_id: guestCartId });
        }

        // Delete guest cart if it doesn't belong to a user
        if (!guestCart.user_id) {
            await this.cartRepository.delete({ id: guestCartId });
        }

        return {
            success: true,
            message: `Successfully merged ${itemsMerged} items into your cart`,
            data: {
                cart_id: userCart.id,
                items_merged: itemsMerged
            }
        };
    }

    // ============== HELPER METHODS ==============

    private toUserProfile(user: User): UserProfile {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            email_verified: !!user.email, // For now, assume verified if exists
            phone_verified: !!user.phone, // For now, assume verified if exists
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }

    private toUserWithSellerProfile(user: User): UserWithSellerProfile {
        const profile = this.toUserProfile(user);

        return {
            ...profile,
            seller_profile: user.seller_profile ? {
                id: user.seller_profile.id,
                kyc_verified: user.seller_profile.kyc_verified,
                gst_number: user.seller_profile.gst_number,
                seller_status: user.seller_profile.seller_status,
                stores: user.seller_profile.stores?.map(store => ({
                    id: store.id,
                    name: store.name,
                    slug: store.slug,
                    is_active: store.is_active,
                    is_verified: store.is_verified,
                    rating_avg: store.rating_avg,
                    rating_count: store.rating_count
                })) || [],
                documents: user.seller_profile.documents?.map(doc => ({
                    id: doc.id,
                    document_type: doc.document_type,
                    status: doc.status
                })) || [],
                created_at: user.seller_profile.created_at
            } : null
        };
    }
}

// Export singleton instance
export const userService = new UserService();
