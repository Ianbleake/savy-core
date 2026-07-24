import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

// ─── Response DTOs ───────────────────────────────────────────────────

export class AuthIdentityDto {
	@ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", description: "Profile ID" })
	id!: string;

	@ApiProperty({ example: "user@example.com", description: "User email" })
	email!: string;
}

export class AuthResponseDto {
	@ApiProperty({ example: "eyJhbGciOiJFUzI1NiIs...", description: "JWT access token" })
	accessToken!: string;

	@ApiProperty({ example: "v1.MjQ2OTY2N...", description: "Refresh token" })
	refreshToken!: string;

	@ApiProperty({ type: AuthIdentityDto, description: "User identity" })
	user!: AuthIdentityDto;
}

export class AuthTokensDto {
	@ApiProperty({ example: "eyJhbGciOiJFUzI1NiIs...", description: "JWT access token" })
	accessToken!: string;

	@ApiProperty({ example: "v1.MjQ2OTY2N...", description: "Refresh token" })
	refreshToken!: string;
}

export class LogoutResponseDto {
	@ApiProperty({ example: "Logged out", description: "Logout confirmation message" })
	message!: string;
}

// ─── Request DTOs ────────────────────────────────────────────────────

export class LoginDto {
	@ApiProperty({ example: "user@example.com", description: "User email" })
	@IsEmail()
	email!: string;

	@ApiProperty({ example: "password123", description: "User password" })
	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class RegisterDto {
	@ApiProperty({ example: "user@example.com", description: "User email" })
	@IsEmail()
	email!: string;

	@ApiProperty({ example: "password123", description: "User password (min 6 chars)", minLength: 6 })
	@IsString()
	@MinLength(6)
	password!: string;

	@ApiPropertyOptional({ example: "John", description: "First name" })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({ example: "Doe", description: "Last name" })
	@IsOptional()
	@IsString()
	lastName?: string;
}

export class RefreshDto {
	@ApiProperty({ description: "Refresh token obtained during login or register" })
	@IsString()
	@IsNotEmpty()
	refreshToken!: string;
}
