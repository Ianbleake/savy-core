import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Profile } from "../generated/prisma/client";
import type { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import type { LoginDto, RefreshDto, RegisterDto } from "./dto/auth.dto";
import { Public } from "./public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@ApiOperation({ summary: "Login with email and password" })
	@ApiResponse({
		status: 200,
		description: "Returns access token, refresh token, and user identity",
	})
	@ApiResponse({ status: 401, description: "Invalid credentials" })
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto.email, dto.password);
	}

	@Public()
	@Post("register")
	@ApiOperation({ summary: "Register a new account" })
	@ApiResponse({
		status: 201,
		description: "Returns access token, refresh token, and user identity",
	})
	@ApiResponse({ status: 409, description: "Email already registered" })
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto.email, dto.password, dto.firstName, dto.lastName);
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
	@ApiOperation({ summary: "Get current authenticated user identity" })
	@ApiResponse({ status: 200, description: "Returns user id and email" })
	async me(@CurrentUser() profile: Profile) {
		return {
			id: profile.id,
			email: profile.email,
		};
	}
}
