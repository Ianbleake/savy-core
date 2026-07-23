import { Controller, Post, Body, Get, Headers } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { CurrentUser } from "./current-user.decorator";
import { LoginDto, RegisterDto, RefreshDto } from "./dto/auth.dto";
import type { User } from "../generated/prisma/client";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@ApiOperation({ summary: "Login with email and password" })
	@ApiResponse({ status: 200, description: "Returns access token, refresh token, and user info" })
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto.email, dto.password);
	}

	@Public()
	@Post("register")
	@ApiOperation({ summary: "Register a new account" })
	@ApiResponse({ status: 201, description: "Returns access token, refresh token, and user info" })
	@ApiResponse({ status: 409, description: "Email already registered" })
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto.email, dto.password, dto.name);
	}

	@Public()
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token" })
	@ApiResponse({ status: 200, description: "Returns new access and refresh tokens" })
	@ApiResponse({ status: 401, description: "Invalid refresh token" })
	async refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@ApiBearerAuth()
	@ApiHeader({ name: "Authorization", description: "Bearer JWT token" })
	@Post("logout")
	@ApiOperation({ summary: "Logout and invalidate session" })
	@ApiResponse({ status: 201, description: "Logged out successfully" })
	async logout(@Headers("authorization") auth: string) {
		const token = auth?.replace("Bearer ", "");
		await this.authService.logout(token);
		return { message: "Logged out" };
	}

	@ApiBearerAuth()
	@Get("me")
	@ApiOperation({ summary: "Get current authenticated user" })
	@ApiResponse({ status: 200, description: "Returns user profile" })
	async me(@CurrentUser() user: User) {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
		};
	}
}