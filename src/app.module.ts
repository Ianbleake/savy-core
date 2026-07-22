import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { UsersModule } from "./users/users.module.js";
import { AccountsModule } from "./accounts/accounts.module.js";
import { JwtAuthGuard } from "./auth/jwt-auth.guard.js";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				transport:
					process.env.NODE_ENV !== "production"
						? { target: "pino-pretty", options: { colorize: true } }
						: undefined,
			},
		}),
		PrismaModule,
		AuthModule,
		UsersModule,
		AccountsModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
