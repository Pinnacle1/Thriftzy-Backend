import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../products/product.entity";

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    order_id: number

    @Column()
    product_id: number

    @Column()
    quantity: number

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price_at_purchase: number

    @Column({ length: 120 })
    title: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => Order, (order) => order.items)
    @JoinColumn({ name: "order_id" })
    order: Order;

    @ManyToOne(() => Product, (product) => product.order_items)
    @JoinColumn({ name: "product_id" })
    product: Product;
}