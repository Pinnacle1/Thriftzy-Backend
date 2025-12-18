import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "../users/user.entity";

@Entity("support_tickets")
export class SupportTicket {
    @PrimaryGeneratedColumn("increment")
    id: number;

    // User who created the ticket (nullable for anonymous submissions)
    @Column({ nullable: true })
    user_id: number;

    // Contact Information (required for follow-up)
    @Column({ length: 120 })
    name: string;

    @Column({ length: 255 })
    email: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    // Ticket Content
    @Column({ length: 255 })
    subject: string;

    @Column({ type: "text" })
    message: string;

    // Ticket Status and Priority
    @Column({ default: "open" })
    status: "open" | "in_progress" | "resolved" | "closed";

    @Column({ default: "medium" })
    priority: "low" | "medium" | "high" | "urgent";

    @Column({ default: "other" })
    category: "order" | "payment" | "product" | "shipping" | "account" | "other";

    // Admin Response
    @Column({ type: "text", nullable: true })
    admin_response: string;

    // Resolution Tracking
    @Column({ nullable: true })
    resolved_by: number;

    @Column({ nullable: true })
    resolved_at: Date;

    // Timestamps
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "user_id" })
    user: User;
}
