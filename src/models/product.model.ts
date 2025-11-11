export class Product {
  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly id?: String,
    public readonly description?: string
  ) {}
}
