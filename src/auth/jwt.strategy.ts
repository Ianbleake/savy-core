import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { StrategyOptionsWithoutRequest } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { UsersService } from "../users/users.service";

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
		private readonly usersService: UsersService,
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
		const user = await this.usersService.findBySupabaseId(payload.sub);
		if (!user) {
			throw new UnauthorizedException("User not found");
		}
		return user;
	}
}