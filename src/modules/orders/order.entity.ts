import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    JoinColumn
} from "typeorm";
import { OrderItem } from "./orderItem.entity";
import { Payment } from "../payments/payment.entity";
import { User } from "../users/user.entity";
import { Store } from "../stores/store.entity";
import { Address } from "../addresses/addresses.entity";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    user_id: number

    @Column()
    store_id: number

    @Column({ nullable: true })
    address_id: number

    @Column({ default: "pending" })
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_amount: number

    // Commission fields - 5% admin commission
    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    admin_commission: number

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    seller_amount: number

    // Payment tracking - all payments go to admin wallet
    @Column({ default: false })
    payment_received: boolean

    // Seller payout status
    @Column({ default: "pending" })
    payout_status: "pending" | "requested" | "processing" | "completed";

    @Column({ nullable: true })
    payout_id: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    items: OrderItem[];

    @OneToOne(() => Payment, (payment) => payment.order)
    payment: Payment;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Store, (store) => store.orders)
    @JoinColumn({ name: "store_id" })
    store: Store;

    @ManyToOne(() => Address, (address) => address.orders)
    @JoinColumn({ name: "address_id" })
    address: Address;
}