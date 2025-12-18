import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { SellerProfile } from "../seller/sellerProfile.entity";
import { Store } from "../stores/store.entity";

@Entity("payouts")
export class Payout {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    seller_id: number

    @Column({ nullable: true })
    store_id: number

    // Total amount from orders (before commission)
    @Column({ type: "decimal", precision: 10, scale: 2 })
    gross_amount: number

    // Admin commission (5%)
    @Column({ type: "decimal", precision: 10, scale: 2 })
    commission_amount: number

    // Net amount to pay seller (95%)
    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number

    @Column({ default: "pending" })
    status: "pending" | "requested" | "approved" | "processing" | "completed" | "rejected" | "failed";

    // Seller's request notes
    @Column({ type: "text", nullable: true })
    request_notes: string

    // Admin's notes when processing
    @Column({ type: "text", nullable: true })
    admin_notes: string

    // Transaction ID from payment processor
    @Column({ nullable: true })
    transaction_id: string

    // Admin who processed this payout
    @Column({ nullable: true })
    processed_by: number

    @Column({ nullable: true })
    processed_at: Date

    // Order IDs included in this payout
    @Column({ type: "jsonb", nullable: true })
    order_ids: number[]

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => SellerProfile, (sellerProfile) => sellerProfile.payouts)
    @JoinColumn({ name: "seller_id" })
    seller_profile: SellerProfile;

    @ManyToOne(() => Store, { nullable: true })
    @JoinColumn({ name: "store_id" })
    store: Store;
}