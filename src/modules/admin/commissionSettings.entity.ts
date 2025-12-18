import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("commission_settings")
export class CommissionSettings {
    @PrimaryGeneratedColumn("increment")
    id: number;

    // Commission rate as decimal (0.05 = 5%)
    @Column({ type: "decimal", precision: 5, scale: 4, default: 0.05 })
    commission_rate: number;

    // Who last updated this setting
    @Column({ nullable: true })
    updated_by: number;

    // Optional note for why commission was changed
    @Column({ type: "text", nullable: true })
    update_note?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
