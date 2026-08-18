import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { ApiErrorResponse, ApiSuccessResponse } from "../common/decorators/api-response.decorator";
import type { Profile } from "../generated/prisma/client";
import { DashboardService } from "./dashboard.service";
import { type DashboardSummary, DashboardSummaryDto } from "./dto/dashboard.dto";

@ApiTags("dashboard")
@ApiBearerAuth()
@Controller("dashboard")
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get("summary")
	@ApiOperation({ summary: "Get dashboard summary" })
	@ApiSuccessResponse(200, DashboardSummaryDto, "Aggregated dashboard summary")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	getSummary(@CurrentUser() profile: Profile): Promise<DashboardSummary> {
		return this.dashboardService.getSummary(profile);
	}
}
