import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import cors from 'cors';
import cookieParser from "cookie-parser";
dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.info(`App is listening to ${PORT}`);
});
