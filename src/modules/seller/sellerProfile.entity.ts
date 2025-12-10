import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
    JoinColumn
} from "typeorm";
import { User } from "../users/user.entity";
import { SellerDocument } from "../sellerDocuments/sellerDocuments.entity";
import { Payout } from "../payouts/payout.entity";
import { Store } from "../stores/store.entity";

/*
    This is the seller profile entity and it has relationship with user entity
*/

@Entity("seller_profiles")
export class SellerProfile {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    user_id: number;

    @Column({ default: false })
    kyc_verified: boolean;

    @Column({ length: 120, nullable: true })
    gst_number: string;

    @Column({ default: "pending" })
    seller_status: "pending" | "approved" | "rejected";

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToOne(() => User, (user) => user.seller_profile)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => SellerDocument, (document) => document.seller_profile)
    documents: SellerDocument[];

    @OneToMany(() => Payout, (payout) => payout.seller_profile)
    payouts: Payout[];

    @OneToMany(() => Store, (store) => store.seller_profile)
    stores: Store[];
}