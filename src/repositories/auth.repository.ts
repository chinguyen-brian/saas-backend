import { PrismaClient } from '../generated/prisma/client.js';
import { User } from '../generated/prisma/client.js';
import bcrypt from 'bcrypt';

export class AuthRepository {
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (user) {
      return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (user) {
      return Promise.resolve(user);
    }

    throw new Error('User not found');
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        tokenHash: await bcrypt.hash(token, 10),
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshTokenByHash(token: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { revoked: false },
    });
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash);
      if (match) return t;
    }
    return null;
  }

  async revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  async revokeUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async createUser(data: { email: string; password: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
