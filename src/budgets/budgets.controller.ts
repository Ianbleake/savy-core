import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiArraySuccessResponse,
	ApiErrorResponse,
	ApiMessageResponse,
	ApiSuccessResponse,
} from "../common/decorators/api-response.decorator";
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
	@ApiArraySuccessResponse(200, BudgetResponseDto, "Returns array of budgets")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
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
	@ApiSuccessResponse(200, BudgetResponseDto, "Returns the budget")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Budget not found")
	@ApiErrorResponse(500, "Internal server error")
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.budgetsService.findOne(id, profile.id);
	}

	@Get(":id/progress")
	@ApiOperation({ summary: "Get budget progress for the current cycle (spent vs budget)" })
	@ApiSuccessResponse(
		200,
		BudgetProgressDto,
		"Returns spent, remaining, percentage, and current cycle dates",
	)
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Budget not found")
	@ApiErrorResponse(500, "Internal server error")
	async getProgress(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.budgetsService.getProgress(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new budget" })
	@ApiSuccessResponse(201, BudgetResponseDto, "Returns the created budget")
	@ApiErrorResponse(400, "Validation error or category must be EXPENSE type")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Category not found")
	@ApiErrorResponse(500, "Internal server error")
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateBudgetDto) {
		return this.budgetsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a budget by ID" })
	@ApiSuccessResponse(200, BudgetResponseDto, "Returns the updated budget")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Budget not found")
	@ApiErrorResponse(500, "Internal server error")
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateBudgetDto,
	) {
		return this.budgetsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete a budget (deactivate)" })
	@ApiMessageResponse(200, "Budget deactivated")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Budget not found")
	@ApiErrorResponse(500, "Internal server error")
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.budgetsService.remove(id, profile.id);
		return { message: "Budget deactivated" };
	}
}
