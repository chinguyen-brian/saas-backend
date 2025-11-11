import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class LoginRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
