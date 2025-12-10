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

@Entity("payouts")
export class Payout {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    seller_id: number

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number

    @Column()
    status: "pending" | "completed" | "failed";

    @Column({ nullable: true })
    reason: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => SellerProfile, (sellerProfile) => sellerProfile.payouts)
    @JoinColumn({ name: "seller_id" })
    seller_profile: SellerProfile;
}