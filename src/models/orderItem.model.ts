export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly orderId?: string,
    public readonly id?: string
  ) {}
}