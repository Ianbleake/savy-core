import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor(configService: ConfigService) {
		const pool = new Pool({
			connectionString: configService.get<string>("DATABASE_URL"),
		});
		const adapter = new PrismaPg(pool);
		super({ adapter });
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
