import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import type { StrategyOptionsWithoutRequest } from "passport-jwt";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { ProfilesService } from "../profiles/profiles.service";

interface JwtPayload {
	sub: string;
	email: string;
	iat: number;
	exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private readonly profilesService: ProfilesService,
	) {
		const supabaseUrl = configService.get<string>("SUPABASE_URL")!;

		const options: StrategyOptionsWithoutRequest = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKeyProvider: passportJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
			}),
		};

		super(options);
	}

	async validate(payload: JwtPayload) {
		const profile = await this.profilesService.findByAuthId(payload.sub);
		if (!profile) {
			throw new UnauthorizedException("Profile not found");
		}
		return profile;
	}
}
