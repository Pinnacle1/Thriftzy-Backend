import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

/*
    Admin entity for admin users management
*/

@Entity("admins")
export class Admin {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ length: 120 })
    name: string;

    @Column({ length: 120, unique: true })
    email: string;

    @Column()
    password_hash: string;

    @Column({ default: "admin" })
    role: "admin" | "super_admin";

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
