import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn
} from "typeorm";
import { CartItem } from "./cartItems.entity";
import { User } from "../users/user.entity";

@Entity("carts")
export class Cart {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    user_id: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    items: CartItem[];

    @OneToOne(() => User, (user) => user.cart)
    @JoinColumn({ name: "user_id" })
    user: User;
}