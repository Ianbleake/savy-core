import { Module } from "@nestjs/common";
import { BudgetsModule } from "../budgets/budgets.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
	imports: [BudgetsModule],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}
