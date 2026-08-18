import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import type { Profile } from "../generated/prisma/client";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import {
	AuthIdentityDto,
	AuthResponseDto,
	AuthTokensDto,
	ForgotPasswordDto,
	LoginDto,
	RefreshDto,
	RegisterDto,
	ResetPasswordDto,
} from "./dto/auth.dto";
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
		type: ApiSuccessResponseDto<AuthResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Invalid credentials", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto.email, dto.password);
	}

	@Public()
	@Post("register")
	@ApiOperation({ summary: "Register a new account" })
	@ApiResponse({
		status: 201,
		description: "Returns access token, refresh token, and user identity",
		type: ApiSuccessResponseDto<AuthResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 409, description: "Email already registered", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto.email, dto.password, dto.firstName, dto.lastName);
	}

	@Public()
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token" })
	@ApiResponse({
		status: 200,
		description: "Returns new access and refresh tokens",
		type: ApiSuccessResponseDto<AuthTokensDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Invalid refresh token", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@ApiBearerAuth()
	@ApiHeader({ name: "Authorization", description: "Bearer JWT token" })
	@Post("logout")
	@ApiOperation({ summary: "Logout and invalidate session" })
	@ApiResponse({ status: 201, description: "Logged out successfully", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async logout(@Headers("authorization") auth: string) {
		const token = auth?.replace("Bearer ", "");
		await this.authService.logout(token);
		return { message: "Logged out" };
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Request a password reset email" })
	@ApiResponse({
		status: 201,
		description: "Reset link sent if email is registered",
		type: ApiMessageResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto.email);
		return { message: "If the email is registered, a reset link has been sent" };
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Reset password using tokens from the email link" })
	@ApiResponse({
		status: 201,
		description: "Password updated successfully",
		type: ApiMessageResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: "Invalid or expired reset token",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.accessToken, dto.refreshToken, dto.newPassword);
		return { message: "Password updated successfully" };
	}

	@ApiBearerAuth()
	@Get("me")
	@ApiOperation({ summary: "Get current authenticated user identity" })
	@ApiResponse({
		status: 200,
		description: "Returns user id and email",
		type: ApiSuccessResponseDto<AuthIdentityDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async me(@CurrentUser() profile: Profile) {
		return {
			id: profile.id,
			email: profile.email,
		};
	}
}
