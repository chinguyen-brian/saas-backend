import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticateAccessToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    req.userId = payload.sub; // gán userId cho req
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
}
