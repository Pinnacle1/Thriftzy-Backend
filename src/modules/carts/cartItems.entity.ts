import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "../products/product.entity";

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    cart_id: number

    @Column()
    product_id: number

    @Column()
    quantity: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => Product, (product) => product.cart_items)
    @JoinColumn({ name: "product_id" })
    product: Product;

    @ManyToOne(() => Cart, (cart) => cart.items)
    @JoinColumn({ name: "cart_id" })
    cart: Cart;
}