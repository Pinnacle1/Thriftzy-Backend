import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn
} from "typeorm";
import { SellerProfile } from "../seller/sellerProfile.entity";



@Entity("seller_pan_kyc")
export class SellerPanKyc {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  seller_id: number;

  @OneToOne(() => SellerProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "seller_id" })
  sellerProfile: SellerProfile;

  @Column({ length: 120 })
  pan_name: string;

  @Column({ length: 4 })
  pan_last4: string;

  @Column()
  pan_hash: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
