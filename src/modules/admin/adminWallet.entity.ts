import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

/*
    AdminWallet entity - Single wallet for all buyer payments
    All orders payments go to this wallet, admin then processes seller payouts
*/

@Entity("admin_wallet")
export class AdminWallet {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    total_balance: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    available_balance: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    pending_payouts: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    total_commission_earned: number;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    total_payouts_processed: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
