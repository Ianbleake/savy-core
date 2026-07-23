import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { UsersService } from "../users/users.service";

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		name: string | null;
	};
}

@Injectable()
export class AuthService {
	constructor(
		private readonly supabaseService: SupabaseService,
		private readonly usersService: UsersService,
	) {}

	async login(email: string, password: string): Promise<AuthResponse> {
		const { data, error } = await this.supabaseService.signInWithPassword(email, password);

		if (error || !data.session) {
			throw new UnauthorizedException("Invalid credentials");
		}

		let user = await this.usersService.findBySupabaseId(data.user.id);
		if (!user) {
			user = await this.usersService.create({
				supabaseId: data.user.id,
				email: data.user.email!,
				name: data.user.user_metadata?.name ?? null,
			});
		}

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token!,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	}

	async register(email: string, password: string, name: string): Promise<AuthResponse> {
		const { data, error } = await this.supabaseService.signUp(email, password);

		if (error) {
			if (error.message.includes("already registered")) {
				throw new ConflictException("Email already registered");
			}
			throw new UnauthorizedException(error.message);
		}

		if (!data.user || !data.session) {
			throw new UnauthorizedException("Registration failed");
		}

		const user = await this.usersService.create({
			supabaseId: data.user.id,
			email: data.user.email!,
			name,
		});

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token!,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	}

	async refresh(refreshToken: string): Promise<AuthTokens> {
		const { data, error } = await this.supabaseService.refreshSession(refreshToken);

		if (error || !data.session) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token!,
		};
	}

	async logout(accessToken: string): Promise<void> {
		await this.supabaseService.signOut(accessToken);
	}
}
