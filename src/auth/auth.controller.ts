import { Controller, Post, Body, Get, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { Public } from "./public.decorator.js";
import { CurrentUser } from "./current-user.decorator.js";
import { LoginDto, RegisterDto, RefreshDto } from "./dto/auth.dto.js";
import type { User } from "../../generated/prisma/client.js";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto.email, dto.password);
	}

	@Public()
	@Post("register")
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto.email, dto.password, dto.name);
	}

	@Public()
	@Post("refresh")
	async refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@Post("logout")
	async logout(@Headers("authorization") auth: string) {
		const token = auth?.replace("Bearer ", "");
		await this.authService.logout(token);
		return { message: "Logged out" };
	}

	@Get("me")
	async me(@CurrentUser() user: User) {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
		};
	}
}
