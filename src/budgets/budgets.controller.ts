import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import type { Profile } from "../generated/prisma/client";
import { BudgetsService } from "./budgets.service";
import {
	BudgetProgressDto,
	BudgetResponseDto,
	CreateBudgetDto,
	QueryBudgetsDto,
	UpdateBudgetDto,
} from "./dto/budget.dto";

@ApiTags("budgets")
@ApiBearerAuth()
@Controller("budgets")
export class BudgetsController {
	constructor(private readonly budgetsService: BudgetsService) {}

	@Get()
	@ApiOperation({ summary: "List all budgets for the current user with optional filters" })
	@ApiResponse({
		status: 200,
		description: "Returns array of budgets",
		type: ApiSuccessResponseDto<BudgetResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryBudgetsDto) {
		return this.budgetsService.findAllByProfile(profile.id, {
			isActive: query.isActive === undefined ? undefined : query.isActive === "true",
			period: query.period,
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single budget by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the budget",
		type: ApiSuccessResponseDto<BudgetResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Budget not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.budgetsService.findOne(id, profile.id);
	}

	@Get(":id/progress")
	@ApiOperation({ summary: "Get budget progress for the current cycle (spent vs budget)" })
	@ApiResponse({
		status: 200,
		description: "Returns spent, remaining, percentage, and current cycle dates",
		type: ApiSuccessResponseDto<BudgetProgressDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Budget not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async getProgress(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.budgetsService.getProgress(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new budget" })
	@ApiResponse({
		status: 201,
		description: "Returns the created budget",
		type: ApiSuccessResponseDto<BudgetResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or category must be EXPENSE type",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Category not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateBudgetDto) {
		return this.budgetsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a budget by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated budget",
		type: ApiSuccessResponseDto<BudgetResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Budget not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateBudgetDto,
	) {
		return this.budgetsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete a budget (deactivate)" })
	@ApiResponse({ status: 200, description: "Budget deactivated", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Budget not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.budgetsService.remove(id, profile.id);
		return { message: "Budget deactivated" };
	}
}
