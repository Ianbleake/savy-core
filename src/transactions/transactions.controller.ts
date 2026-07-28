import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import type { Profile } from "../generated/prisma/client";
import {
	CreateTransactionDto,
	TransactionResponseDto,
	UpdateTransactionDto,
} from "./dto/transaction.dto";
import { TransactionsService } from "./transactions.service";

@ApiTags("transactions")
@ApiBearerAuth()
@Controller("transactions")
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Get()
	@ApiOperation({ summary: "List transactions with filters and pagination" })
	@ApiQuery({ name: "accountId", required: false, description: "Filter by account (source or destination)" })
	@ApiQuery({ name: "type", enum: ["INCOME", "EXPENSE", "TRANSFER", "PAYMENT"], required: false })
	@ApiQuery({ name: "categoryId", required: false, description: "Filter by category" })
	@ApiQuery({ name: "from", required: false, description: "Start date (ISO 8601)" })
	@ApiQuery({ name: "to", required: false, description: "End date (ISO 8601)" })
	@ApiQuery({ name: "page", required: false, description: "Page number (default 1)" })
	@ApiQuery({ name: "limit", required: false, description: "Items per page (default 50, max 100)" })
	@ApiResponse({ status: 200, description: "Returns paginated transactions", type: [TransactionResponseDto] })
	async findAll(
		@CurrentUser() profile: Profile,
		@Query("accountId") accountId?: string,
		@Query("type") type?: "INCOME" | "EXPENSE" | "TRANSFER" | "PAYMENT",
		@Query("categoryId") categoryId?: string,
		@Query("from") from?: string,
		@Query("to") to?: string,
		@Query("page") page?: string,
		@Query("limit") limit?: string,
	) {
		return this.transactionsService.findAllByProfile(profile.id, {
			accountId,
			type,
			categoryId,
			from: from ? new Date(from) : undefined,
			to: to ? new Date(to) : undefined,
			page: page ? Number.parseInt(page, 10) : undefined,
			limit: limit ? Number.parseInt(limit, 10) : undefined,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single transaction by ID" })
	@ApiResponse({ status: 200, description: "Returns the transaction", type: TransactionResponseDto })
	@ApiResponse({ status: 404, description: "Transaction not found" })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.transactionsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new transaction (automatically updates account balances)" })
	@ApiResponse({ status: 201, description: "Returns the created transaction", type: TransactionResponseDto })
	@ApiResponse({ status: 400, description: "Invalid transaction rules (destination account, category type mismatch)" })
	@ApiResponse({ status: 404, description: "Account or category not found" })
	async create(
		@CurrentUser() profile: Profile,
		@Body() dto: CreateTransactionDto,
	) {
		return this.transactionsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a transaction (reverses old balance, applies new)" })
	@ApiResponse({ status: 200, description: "Returns the updated transaction", type: TransactionResponseDto })
	@ApiResponse({ status: 404, description: "Transaction not found" })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateTransactionDto,
	) {
		return this.transactionsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a transaction (reverses balance effect)" })
	@ApiResponse({ status: 200, description: "Transaction deleted" })
	@ApiResponse({ status: 404, description: "Transaction not found" })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.transactionsService.remove(id, profile.id);
		return { message: "Transaction deleted" };
	}
}