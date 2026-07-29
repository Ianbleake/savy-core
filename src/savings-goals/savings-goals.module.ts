import { Module } from "@nestjs/common";
import { SavingsGoalsController } from "./savings-goals.controller";
import { SavingsGoalsService } from "./savings-goals.service";

@Module({
	providers: [SavingsGoalsService],
	controllers: [SavingsGoalsController],
	exports: [SavingsGoalsService],
})
export class SavingsGoalsModule {}
