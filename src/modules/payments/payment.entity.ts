import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from "typeorm";
import { Order } from "../orders/order.entity";

@Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    order_id: number

    @Column()
    provider: string // stripe, paypal, razorpay

    @Column()
    provider_order_id: string

    @Column()
    provider_payment_id: string

    @Column()
    status: "pending" | "paid" | "failed";

    @Column()
    payment_method: "stripe" | "paypal" | "razorpay";

    @Column({ type: "jsonb", nullable: true })
    raw_response: object

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @OneToOne(() => Order, (order) => order.payment)
    @JoinColumn({ name: "order_id" })
    order: Order;
}