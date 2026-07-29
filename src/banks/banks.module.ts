import { Module } from "@nestjs/common";
import { BanksController } from "./banks.controller";
import { BanksService } from "./banks.service";

@Module({
	providers: [BanksService],
	controllers: [BanksController],
	exports: [BanksService],
})
export class BanksModule {}
