import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { ApiErrorResponseDto, ApiSuccessResponseDto } from "../common/dto/api-response.dto";
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
	@ApiResponse({
		status: 200,
		type: ApiSuccessResponseDto<DashboardSummaryDto>,
		description: "Aggregated dashboard summary",
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	getSummary(@CurrentUser() profile: Profile): Promise<DashboardSummary> {
		return this.dashboardService.getSummary(profile);
	}
}
