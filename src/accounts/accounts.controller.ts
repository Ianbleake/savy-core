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
	@ApiArraySuccessResponse(200, AccountResponseDto, "Returns array of accounts")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
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
	@ApiSuccessResponse(200, AccountResponseDto, "Returns the account")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Account not found")
	@ApiErrorResponse(500, "Internal server error")
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.accountsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new account" })
	@ApiSuccessResponse(201, AccountResponseDto, "Returns the created account")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateAccountDto) {
		return this.accountsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update an account by ID" })
	@ApiSuccessResponse(200, AccountResponseDto, "Returns the updated account")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Account not found")
	@ApiErrorResponse(500, "Internal server error")
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateAccountDto,
	) {
		return this.accountsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete an account (deactivate)" })
	@ApiMessageResponse(200, "Account deactivated")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(404, "Account not found")
	@ApiErrorResponse(500, "Internal server error")
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.accountsService.remove(id, profile.id);
		return { message: "Account deactivated" };
	}
}
