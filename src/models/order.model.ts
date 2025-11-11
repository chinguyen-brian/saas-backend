import { OrderItem } from './orderItem.model.js';

export class Order {
  constructor(
    public readonly total: number,
    public readonly shippingAddress?: string,
    public readonly paymentMethod?: string,
    public readonly status: string = 'PENDING',
    public readonly orderItems: OrderItem[] = [],
    public readonly id?: string
  ) {}
}
