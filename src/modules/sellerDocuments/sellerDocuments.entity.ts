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

@Entity("seller_documents")
export class SellerDocument {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    seller_id: number

    @Column()
    document_type: "aadhar" | "pan" | "gst" | "bank";

    @Column()
    document_number: string

    @Column()
    document_url: string

    @Column({ default: "pending" })
    status: "pending" | "approved" | "rejected";

    @Column({ nullable: true })
    reason: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => SellerProfile, (sellerProfile) => sellerProfile.documents)
    @JoinColumn({ name: "seller_id" })
    seller_profile: SellerProfile;
}