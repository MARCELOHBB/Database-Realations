import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('User not found.');

    const productsId = products.map(product => {
      const { id } = product;
      return { id };
    });

    const productsInfo = await this.productsRepository.findAllById(productsId);

    const parsedProducts = products.map(product => {
      const productIndex = productsInfo.findIndex(
        productInfo => productInfo.id === product.id,
      );

      if (productsInfo[productIndex].quantity < product.quantity)
        throw new AppError('Invalid balance of product to post order');

      const product_id = product.id;
      const { price } = productsInfo[productIndex];
      const { quantity } = product;

      return { product_id, price, quantity };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: parsedProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateProductService;
