import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Product } from "./product.entity";

@Entity("product_attributes")
export class ProductAttribute {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    product_id: number

    @Column({ length: 120 })
    name: string

    @Column({ length: 255 })
    value: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => Product, (product) => product.attributes)
    @JoinColumn({ name: "product_id" })
    product: Product;
}