import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { AccountsService } from "./accounts.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto.js";
import type { User } from "../../generated/prisma/client.js";

@Controller("accounts")
export class AccountsController {
	constructor(private readonly accountsService: AccountsService) {}

	@Get()
	async findAll(@CurrentUser() user: User) {
		return this.accountsService.findAllByUser(user.id);
	}

	@Get(":id")
	async findOne(@Param("id") id: string, @CurrentUser() user: User) {
		return this.accountsService.findOne(id, user.id);
	}

	@Post()
	async create(@CurrentUser() user: User, @Body() dto: CreateAccountDto) {
		return this.accountsService.create(user.id, dto);
	}

	@Patch(":id")
	async update(
		@Param("id") id: string,
		@CurrentUser() user: User,
		@Body() dto: UpdateAccountDto,
	) {
		return this.accountsService.update(id, user.id, dto);
	}

	@Delete(":id")
	async remove(@Param("id") id: string, @CurrentUser() user: User) {
		await this.accountsService.remove(id, user.id);
		return { message: "Account deactivated" };
	}
}
