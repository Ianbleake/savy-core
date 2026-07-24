import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ProfilesModule } from "../profiles/profiles.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { SupabaseService } from "./supabase.service";

@Module({
	imports: [
		ProfilesModule,
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>("SUPABASE_JWT_SECRET"),
				signOptions: { expiresIn: "1h" },
			}),
		}),
	],
	providers: [AuthService, JwtStrategy, SupabaseService],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
