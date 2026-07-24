import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
	private readonly client: SupabaseClient;

	constructor(private readonly configService: ConfigService) {
		this.client = createClient(
			this.configService.get<string>("SUPABASE_URL")!,
			this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY")!,
			{
				auth: {
					autoRefreshToken: false,
					persistSession: false,
				},
			},
		);
	}

	getClient(): SupabaseClient {
		return this.client;
	}

	async signInWithPassword(email: string, password: string) {
		return this.client.auth.signInWithPassword({ email, password });
	}

	async signUp(email: string, password: string) {
		return this.client.auth.signUp({ email, password });
	}

	async refreshSession(refreshToken: string) {
		return this.client.auth.refreshSession({ refresh_token: refreshToken });
	}

	async signOut(accessToken: string) {
		return this.client.auth.admin.signOut(accessToken);
	}

	async resetPasswordForEmail(email: string, redirectTo: string) {
		return this.client.auth.resetPasswordForEmail(email, { redirectTo });
	}

	async setSession(accessToken: string, refreshToken: string) {
		return this.client.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken,
		});
	}

	async updateUser(accessToken: string, attributes: { password: string }) {
		// Use admin API to update user by first getting user from token
		const {
			data: { user },
			error: sessionError,
		} = await this.client.auth.getUser(accessToken);
		if (sessionError || !user) {
			return { data: { user: null }, error: sessionError };
		}
		return this.client.auth.admin.updateUserById(user.id, attributes);
	}
}
