import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import {
	CreateSavingsGoalDto,
	SavingsGoalResponseDto,
	UpdateSavingsGoalDto,
} from "./dto/savings-goal.dto";
import { SavingsGoalsService } from "./savings-goals.service";

@ApiTags("savings-goals")
@ApiBearerAuth()
@Controller("savings-goals")
export class SavingsGoalsController {
	constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

	@Get()
	@ApiOperation({ summary: "List all savings goals for the current user" })
	@ApiResponse({ status: 200, description: "Returns array of savings goals with computed progress", type: [SavingsGoalResponseDto] })
	async findAll(@CurrentUser() profile: Profile) {
		return this.savingsGoalsService.findAllByProfile(profile.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single savings goal by ID" })
	@ApiResponse({ status: 200, description: "Returns the savings goal with computed progress", type: SavingsGoalResponseDto })
	@ApiResponse({ status: 404, description: "Savings goal not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.savingsGoalsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new savings goal" })
	@ApiResponse({ status: 201, description: "Returns the created savings goal", type: SavingsGoalResponseDto })
	@ApiResponse({ status: 400, description: "Account must be DEBIT or CASH" })
	@ApiResponse({ status: 404, description: "Account not found" })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateSavingsGoalDto) {
		return this.savingsGoalsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a savings goal by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated savings goal", type: SavingsGoalResponseDto })
	@ApiResponse({ status: 404, description: "Savings goal not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateSavingsGoalDto,
	) {
		return this.savingsGoalsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a savings goal (account and balance are not affected)" })
	@ApiResponse({ status: 200, description: "Savings goal deleted" })
	@ApiResponse({ status: 404, description: "Savings goal not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.savingsGoalsService.remove(id, profile.id);
		return { message: "Savings goal deleted" };
	}
}