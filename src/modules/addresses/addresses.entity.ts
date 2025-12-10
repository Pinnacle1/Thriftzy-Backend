import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";
import { User } from "../users/user.entity";
import { Order } from "../orders/order.entity";

@Entity("addresses")
export class Address {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    user_id: number

    @Column()
    name: string

    @Column()
    phone: string

    @Column()
    line1: string

    @Column({ nullable: true })
    line2: string

    @Column()
    city: string

    @Column()
    state: string

    @Column()
    country: string

    @Column({ default: false })
    is_default: boolean

    @Column()
    pincode: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => User, (user) => user.addresses)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => Order, (order) => order.address)
    orders: Order[];
}