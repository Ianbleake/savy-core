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
}
