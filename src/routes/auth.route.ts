import { RequestValidator } from '../middleware/validator.middleware.js';
import express, { Request, Response } from 'express';
import { RegisterRequest, LoginRequest } from '../dto/auth.dto.js';
import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

export const authService = new AuthService(new AuthRepository());

// ---------------- Register ----------------
router.post('/register', async (req, res) => {
  const { errors, input } = await RequestValidator(RegisterRequest, req.body);

  if (errors) return res.status(400).json(errors);
  try {
    const user = await authService.register(input);
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// ---------------- Login ----------------
router.post('/login', async (req, res) => {
  const { errors, input } = await RequestValidator(LoginRequest, req.body);

  if (errors) return res.status(400).json(errors);
  try {
    const result = await authService.login(input);
    if (!result)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Gửi refresh token HttpOnly
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: result.user, token: result.accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- Refresh Token ----------------
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const tokens = await authService.refreshToken(refreshToken);

    // Send new refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// ---------------- Logout ----------------
router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    await authService.logout(refreshToken);
  } catch (err) {
    console.error(err);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  return res.json({ ok: true });
});

// ---------------- Get Current User ----------------
router.get('/me', authenticateAccessToken, async (req: any, res) => {
  try {
    const user = await authService.me(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
