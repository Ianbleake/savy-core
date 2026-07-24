import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { ProfilesService } from "../profiles/profiles.service";
import type { SupabaseService } from "./supabase.service";

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
	};
}

@Injectable()
export class AuthService {
	constructor(
		private readonly supabaseService: SupabaseService,
		private readonly profilesService: ProfilesService,
	) {}

	async login(email: string, password: string): Promise<AuthResponse> {
		const { data, error } = await this.supabaseService.signInWithPassword(email, password);

		if (error || !data.session) {
			throw new UnauthorizedException("Invalid credentials");
		}

		let profile = await this.profilesService.findByAuthId(data.user.id);
		if (!profile) {
			profile = await this.profilesService.create({
				authId: data.user.id,
				email: data.user.email!,
				firstName: data.user.user_metadata?.first_name ?? data.user.user_metadata?.name ?? null,
				lastName: data.user.user_metadata?.last_name ?? null,
			});
		}

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token!,
			user: {
				id: profile.id,
				email: profile.email,
			},
		};
	}

	async register(
		email: string,
		password: string,
		firstName?: string,
		lastName?: string,
	): Promise<AuthResponse> {
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

		const profile = await this.profilesService.create({
			authId: data.user.id,
			email: data.user.email!,
			firstName: firstName ?? null,
			lastName: lastName ?? null,
		});

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token!,
			user: {
				id: profile.id,
				email: profile.email,
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
