export class RefreshToken {
  constructor(
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly revoked: boolean = false,
    public readonly replacedBy?: string,
    public readonly userId?: string,
    public readonly id?: string
  ) {}
}
