import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from "typeorm";
import { SellerProfile } from "../seller/sellerProfile.entity";


@Entity("seller_aadhaar_kyc")
export class SellerAadhaarKyc {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  seller_id: number;

  @OneToOne(() => SellerProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "seller_id" })
  sellerProfile: SellerProfile;

  @Column({ length: 120 })
  aadhaar_name: string;

  @Column({ length: 4 })
  aadhaar_last4: string;

  @Column()
  aadhaar_hash: string;

  @Column({ default: false })
  verified: boolean;
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
