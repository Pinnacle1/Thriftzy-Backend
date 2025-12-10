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

@Entity("product_images")
/*
    This is the product image entity and it has relationship with product entity
*/
export class ProductImage {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    product_id: number

    @Column({ length: 255 })
    image_url: string

    @Column({ default: 0 })
    position: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => Product, (product) => product.images)
    @JoinColumn({ name: "product_id" })
    product: Product;
}