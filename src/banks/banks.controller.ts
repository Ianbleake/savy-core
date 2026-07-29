import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import { BanksService } from "./banks.service";
import { BankResponseDto, CreateBankDto, QueryBanksDto, UpdateBankDto } from "./dto/bank.dto";

@ApiTags("banks")
@ApiBearerAuth()
@Controller("banks")
export class BanksController {
	constructor(private readonly banksService: BanksService) {}

	@Get()
	@ApiOperation({ summary: "List all banks for the current user with optional filters" })
	@ApiResponse({ status: 200, description: "Returns array of banks", type: [BankResponseDto] })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryBanksDto) {
		return this.banksService.findAllByProfile(profile.id, {
			isActive: query.isActive === undefined ? undefined : query.isActive === "true",
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single bank by ID with its accounts (control center view)" })
	@ApiResponse({
		status: 200,
		description: "Returns the bank with nested accounts, credit cards, and loans",
	})
	@ApiResponse({ status: 404, description: "Bank not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.banksService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new bank" })
	@ApiResponse({ status: 201, description: "Returns the created bank", type: BankResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateBankDto) {
		return this.banksService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a bank by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated bank", type: BankResponseDto })
	@ApiResponse({ status: 404, description: "Bank not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateBankDto,
	) {
		return this.banksService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete a bank (deactivate)" })
	@ApiResponse({ status: 200, description: "Bank deactivated" })
	@ApiResponse({ status: 404, description: "Bank not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.banksService.remove(id, profile.id);
		return { message: "Bank deactivated" };
	}
}
