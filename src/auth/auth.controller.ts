import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	ApiErrorResponse,
	ApiMessageResponse,
	ApiSuccessResponse,
} from "../common/decorators/api-response.decorator";
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
	@ApiSuccessResponse(
		200,
		AuthResponseDto,
		"Returns access token, refresh token, and user identity",
	)
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Invalid credentials")
	@ApiErrorResponse(500, "Internal server error")
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto.email, dto.password);
	}

	@Public()
	@Post("register")
	@ApiOperation({ summary: "Register a new account" })
	@ApiSuccessResponse(
		201,
		AuthResponseDto,
		"Returns access token, refresh token, and user identity",
	)
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(409, "Email already registered")
	@ApiErrorResponse(500, "Internal server error")
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto.email, dto.password, dto.firstName, dto.lastName);
	}

	@Public()
	@Post("refresh")
	@ApiOperation({ summary: "Refresh access token" })
	@ApiSuccessResponse(200, AuthTokensDto, "Returns new access and refresh tokens")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Invalid refresh token")
	@ApiErrorResponse(500, "Internal server error")
	async refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@ApiBearerAuth()
	@ApiHeader({ name: "Authorization", description: "Bearer JWT token" })
	@Post("logout")
	@ApiOperation({ summary: "Logout and invalidate session" })
	@ApiMessageResponse(201, "Logged out successfully")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async logout(@Headers("authorization") auth: string) {
		const token = auth?.replace("Bearer ", "");
		await this.authService.logout(token);
		return { message: "Logged out" };
	}

	@Public()
	@Post("forgot-password")
	@ApiOperation({ summary: "Request a password reset email" })
	@ApiMessageResponse(201, "Reset link sent if email is registered")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(500, "Internal server error")
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto.email);
		return { message: "If the email is registered, a reset link has been sent" };
	}

	@Public()
	@Post("reset-password")
	@ApiOperation({ summary: "Reset password using tokens from the email link" })
	@ApiMessageResponse(201, "Password updated successfully")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Invalid or expired reset token")
	@ApiErrorResponse(500, "Internal server error")
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.accessToken, dto.refreshToken, dto.newPassword);
		return { message: "Password updated successfully" };
	}

	@ApiBearerAuth()
	@Get("me")
	@ApiOperation({ summary: "Get current authenticated user identity" })
	@ApiSuccessResponse(200, AuthIdentityDto, "Returns user id and email")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async me(@CurrentUser() profile: Profile) {
		return {
			id: profile.id,
			email: profile.email,
		};
	}
}
