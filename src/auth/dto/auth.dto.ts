import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

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
