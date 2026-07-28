import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import { CreateLoanDto, LoanResponseDto, UpdateLoanDto } from "./dto/loan.dto";
import { LoansService } from "./loans.service";

@ApiTags("loans")
@ApiBearerAuth()
@Controller("loans")
export class LoansController {
	constructor(private readonly loansService: LoansService) {}

	@Get()
	@ApiOperation({ summary: "List all loans for the current user" })
	@ApiResponse({ status: 200, description: "Returns array of loans", type: [LoanResponseDto] })
	async findAll(@CurrentUser() profile: Profile) {
		return this.loansService.findAllByProfile(profile.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single loan by ID" })
	@ApiResponse({ status: 200, description: "Returns the loan", type: LoanResponseDto })
	@ApiResponse({ status: 404, description: "Loan not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.loansService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create loan details for a LOAN account" })
	@ApiResponse({ status: 201, description: "Returns the created loan", type: LoanResponseDto })
	@ApiResponse({ status: 400, description: "Account must be LOAN type or already has a loan" })
	@ApiResponse({ status: 404, description: "Account not found" })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateLoanDto) {
		return this.loansService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a loan by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated loan", type: LoanResponseDto })
	@ApiResponse({ status: 404, description: "Loan not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateLoanDto,
	) {
		return this.loansService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete loan details (the account survives)" })
	@ApiResponse({ status: 200, description: "Loan deleted" })
	@ApiResponse({ status: 404, description: "Loan not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.loansService.remove(id, profile.id);
		return { message: "Loan deleted" };
	}
}