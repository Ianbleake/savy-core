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
import { BanksService } from "./banks.service";
import { BankResponseDto, CreateBankDto, QueryBanksDto, UpdateBankDto } from "./dto/bank.dto";
import { BankSummaryResponseDto, QueryBankSummaryDto } from "./dto/bank-summary.dto";

@ApiTags("banks")
@ApiBearerAuth()
@Controller("banks")
export class BanksController {
	constructor(private readonly banksService: BanksService) {}

	@Get()
	@ApiOperation({ summary: "List all banks for the current user with optional filters" })
	@ApiArraySuccessResponse(200, BankResponseDto, "Returns array of banks")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryBanksDto) {
		return this.banksService.findAllByProfile(profile.id, {
			isActive: query.isActive === undefined ? undefined : query.isActive === "true",
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id/summary")
	@ApiOperation({ summary: "Get bank financial summary" })
	@ApiSuccessResponse(
		200,
		BankSummaryResponseDto,
		"Returns the bank financial summary with KPIs, income/expenses, and loans",
	)
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Bank not found")
	@ApiErrorResponse(422, "Invalid period value")
	@ApiErrorResponse(500, "Internal server error")
	async getSummary(
		@Param("id") id: string,
		@Query() query: QueryBankSummaryDto,
		@CurrentUser() profile: Profile,
	) {
		return this.banksService.getSummary(id, profile, query.period ?? "month");
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single bank by ID with its accounts (control center view)" })
	@ApiSuccessResponse(
		200,
		BankResponseDto,
		"Returns the bank with nested accounts, credit cards, and loans",
	)
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Bank not found")
	@ApiErrorResponse(500, "Internal server error")
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.banksService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new bank" })
	@ApiSuccessResponse(201, BankResponseDto, "Returns the created bank")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateBankDto) {
		return this.banksService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a bank by ID" })
	@ApiSuccessResponse(200, BankResponseDto, "Returns the updated bank")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Bank not found")
	@ApiErrorResponse(500, "Internal server error")
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateBankDto,
	) {
		return this.banksService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete a bank (deactivate)" })
	@ApiMessageResponse(200, "Bank deactivated")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Bank not found")
	@ApiErrorResponse(500, "Internal server error")
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.banksService.remove(id, profile.id);
		return { message: "Bank deactivated" };
	}
}
