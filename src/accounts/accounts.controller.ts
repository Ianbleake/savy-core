import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import type { Profile } from "../generated/prisma/client";
import { AccountsService } from "./accounts.service";
import {
	AccountResponseDto,
	CreateAccountDto,
	QueryAccountsDto,
	UpdateAccountDto,
} from "./dto/account.dto";

@ApiTags("accounts")
@ApiBearerAuth()
@Controller("accounts")
export class AccountsController {
	constructor(private readonly accountsService: AccountsService) {}

	@Get()
	@ApiOperation({ summary: "List all accounts for the current user with optional filters" })
	@ApiResponse({
		status: 200,
		description: "Returns array of accounts",
		type: ApiSuccessResponseDto<AccountResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryAccountsDto) {
		return this.accountsService.findAllByProfile(profile.id, {
			type: query.type,
			bankId: query.bankId,
			isActive: query.isActive === undefined ? undefined : query.isActive === "true",
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single account by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the account",
		type: ApiSuccessResponseDto<AccountResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Account not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.accountsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new account" })
	@ApiResponse({
		status: 201,
		description: "Returns the created account",
		type: ApiSuccessResponseDto<AccountResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateAccountDto) {
		return this.accountsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update an account by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated account",
		type: ApiSuccessResponseDto<AccountResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Account not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateAccountDto,
	) {
		return this.accountsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete an account (deactivate)" })
	@ApiResponse({ status: 200, description: "Account deactivated", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Account not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.accountsService.remove(id, profile.id);
		return { message: "Account deactivated" };
	}
}
