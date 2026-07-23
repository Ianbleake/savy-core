import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AccountsService } from "./accounts.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";
import type { User } from "../generated/prisma/client";

@ApiTags("accounts")
@ApiBearerAuth()
@Controller("accounts")
export class AccountsController {
	constructor(private readonly accountsService: AccountsService) {}

	@Get()
	@ApiOperation({ summary: "List all active accounts for the current user" })
	@ApiResponse({ status: 200, description: "Returns array of accounts" })
	async findAll(@CurrentUser() user: User) {
		return this.accountsService.findAllByUser(user.id);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single account by ID" })
	@ApiResponse({ status: 200, description: "Returns the account" })
	@ApiResponse({ status: 404, description: "Account not found" })
	async findOne(@Param("id") id: string, @CurrentUser() user: User) {
		return this.accountsService.findOne(id, user.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new account" })
	@ApiResponse({ status: 201, description: "Returns the created account" })
	async create(@CurrentUser() user: User, @Body() dto: CreateAccountDto) {
		return this.accountsService.create(user.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update an account by ID" })
	@ApiResponse({ status: 200, description: "Returns the updated account" })
	@ApiResponse({ status: 404, description: "Account not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() user: User,
		@Body() dto: UpdateAccountDto,
	) {
		return this.accountsService.update(id, user.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Soft-delete an account (deactivate)" })
	@ApiResponse({ status: 200, description: "Account deactivated" })
	@ApiResponse({ status: 404, description: "Account not found" })
	async remove(@Param("id") id: string, @CurrentUser() user: User) {
		await this.accountsService.remove(id, user.id);
		return { message: "Account deactivated" };
	}
}