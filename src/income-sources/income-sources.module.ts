import { Module } from "@nestjs/common";
import { IncomeSourcesController } from "./income-sources.controller";
import { IncomeSourcesService } from "./income-sources.service";

@Module({
	providers: [IncomeSourcesService],
	controllers: [IncomeSourcesController],
	exports: [IncomeSourcesService],
})
export class IncomeSourcesModule {}
