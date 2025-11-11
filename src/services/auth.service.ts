import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import { LoginRequest, RegisterRequest } from '../dto/auth.dto.js';
import { User } from '../models/user.model.js';

export class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  // ---------------- Register ----------------
  async register({ email, password }: RegisterRequest): Promise<User> {
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.repository.createUser({
      email,
      password: hashedPassword,
    });
    return { id: user.id, email: user.email, active: user.active };
  }

  async login({ email, password }: LoginRequest): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  } | null> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    const accessToken = jwt.sign(
      { sub: user.id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: '7d',
      }
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.repository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: { id: user.id, email: user.email, active: user.active },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const savedToken = await this.repository.findRefreshTokenByHash(token);
    if (
      !savedToken ||
      savedToken.revoked ||
      savedToken.expiresAt < new Date()
    ) {
      throw new Error('Invalid refresh token');
    }

    const userId = savedToken.userId;

    // Issue new access token
    const accessToken = jwt.sign(
      { sub: userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    // Optionally: issue new refresh token (rotating)
    const newRefreshToken = jwt.sign(
      { sub: userId },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // Revoke old token, save new token
    await this.repository.revokeRefreshToken(savedToken.id);
    await this.repository.saveRefreshToken(
      userId,
      newRefreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const savedToken = await this.repository.findRefreshTokenByHash(
      refreshToken
    );
    if (savedToken) {
      await this.repository.revokeRefreshToken(savedToken.id);
    }
  }

  async me(userId: string) {
    const user = await this.repository.findUserById(userId);
    const { password, ...userData } = user;
    return userData;
  }
}
