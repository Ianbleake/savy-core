import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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

	@ApiProperty({ example: "John Doe", description: "User full name" })
	@IsString()
	@IsNotEmpty()
	name!: string;
}

export class RefreshDto {
	@ApiProperty({ description: "Refresh token obtained during login or register" })
	@IsString()
	@IsNotEmpty()
	refreshToken!: string;
}