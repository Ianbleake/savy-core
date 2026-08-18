import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import type { Profile } from "../generated/prisma/client";
import { CreateLoanDto, LoanResponseDto, QueryLoansDto, UpdateLoanDto } from "./dto/loan.dto";
import { LoansService } from "./loans.service";

@ApiTags("loans")
@ApiBearerAuth()
@Controller("loans")
export class LoansController {
	constructor(private readonly loansService: LoansService) {}

	@Get()
	@ApiOperation({ summary: "List all loans for the current user with optional sort" })
	@ApiResponse({
		status: 200,
		description: "Returns array of loans",
		type: ApiSuccessResponseDto<LoanResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryLoansDto) {
		return this.loansService.findAllByProfile(profile.id, {
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single loan by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the loan",
		type: ApiSuccessResponseDto<LoanResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Loan not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.loansService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create loan details for a LOAN account" })
	@ApiResponse({
		status: 201,
		description: "Returns the created loan",
		type: ApiSuccessResponseDto<LoanResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or account must be LOAN type or already has a loan",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Account not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateLoanDto) {
		return this.loansService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a loan by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated loan",
		type: ApiSuccessResponseDto<LoanResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Loan not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateLoanDto,
	) {
		return this.loansService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete loan details (the account survives)" })
	@ApiResponse({ status: 200, description: "Loan deleted", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Loan not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.loansService.remove(id, profile.id);
		return { message: "Loan deleted" };
	}
}
