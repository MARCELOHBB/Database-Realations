import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import ColumnNumericTransformer from '@shared/infra/typeorm/ColumnNumericTransformer';

import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('products')
class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', {
    precision: 7,
    scale: 2,
  })
  price: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  quantity: number;

  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Product;
