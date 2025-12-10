import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "../users/user.entity";

@Entity("refresh_tokens")
export class RefreshToken {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    user_id: number;

    @Column({ unique: true })
    token: string;

    @Column()
    expires_at: Date;

    @Column({ default: false })
    is_revoked: boolean;

    @Column({ nullable: true })
    device_info: string;

    @Column({ nullable: true })
    ip_address: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;
}
