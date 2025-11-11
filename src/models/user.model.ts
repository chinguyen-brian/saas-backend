export class User {
  constructor(
    public readonly email: string,
    public readonly active: boolean = true,
    public readonly name?: string | null,
    public readonly avatarUrl?: string,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
