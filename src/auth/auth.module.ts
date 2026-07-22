import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { SupabaseService } from "./supabase.service.js";
import { UsersModule } from "../users/users.module.js";

@Module({
	imports: [
		UsersModule,
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
