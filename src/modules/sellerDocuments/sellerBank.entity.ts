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



@Entity("seller_bank_kyc")
export class SellerBankKyc {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  seller_id: number;

  @OneToOne(() => SellerProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "seller_id" })
  sellerProfile: SellerProfile;

  @Column({ length: 120 })
  account_holder_name: string;

  @Column({ length: 4 })
  account_last4: string;

  @Column()
  account_hash: string;

  @Column({ length: 11 })
  ifsc_code: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
