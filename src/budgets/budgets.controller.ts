import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import {
	BudgetProgressDto,
	BudgetResponseDto,
	CreateBudgetDto,
	UpdateBudgetDto,
} from "./dto/budget.dto";
import { BudgetsService } from "./budgets.service";

@ApiTags("budgets")
@ApiBearerAuth()
@Controller("budgets")
export class BudgetsController {
	constructor(private readonly budgetsService: BudgetsService) {}

	@Get()
	@ApiOperation({ summary: "List all active budgets for the current user" })
	@ApiResponse({ status: 200, description: "Returns array of budgets", type: [BudgetResponseDto] })
	async findAll(@CurrentUser() profile: Profile) {
		return this.budgetsService.findAllByProfile(profile.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single budget by ID" })
	@ApiResponse({ status: 200, description: "Returns the budget", type: BudgetResponseDto })
	@ApiResponse({ status: 404, description: "Budget not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.budgetsService.findOne(id, profile.id);
	}

	@Get(":id/progress")
	@ApiOperation({ summary: "Get budget progress for the current cycle (spent vs budget)" })
	@ApiResponse({ status: 200, description: "Returns spent, remaining, percentage, and current cycle dates", type: BudgetProgressDto })
	@ApiResponse({ status: 404, description: "Budget not found" })
	async getProgress(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.budgetsService.getProgress(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new budget" })
	@ApiResponse({ status: 201, description: "Returns the created budget", type: BudgetResponseDto })
	@ApiResponse({ status: 400, description: "Category must be EXPENSE type" })
	@ApiResponse({ status: 404, description: "Category not found" })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateBudgetDto) {
		return this.budgetsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a budget by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated budget", type: BudgetResponseDto })
	@ApiResponse({ status: 404, description: "Budget not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateBudgetDto,
	) {
		return this.budgetsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete a budget (deactivate)" })
	@ApiResponse({ status: 200, description: "Budget deactivated" })
	@ApiResponse({ status: 404, description: "Budget not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.budgetsService.remove(id, profile.id);
		return { message: "Budget deactivated" };
	}
}