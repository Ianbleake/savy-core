import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import {
	ApiErrorResponseDto,
	ApiMessageResponseDto,
	ApiSuccessResponseDto,
} from "../common/dto/api-response.dto";
import { PaginatedResponseDto } from "../common/dto/pagination.dto";
import type { Profile } from "../generated/prisma/client";
import {
	CreateTransactionDto,
	QueryTransactionsDto,
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
	@ApiOperation({ summary: "List transactions with filters, sort, and pagination" })
	@ApiQuery({
		name: "accountId",
		required: false,
		description: "Filter by account (source or destination)",
	})
	@ApiQuery({ name: "type", enum: ["INCOME", "EXPENSE", "TRANSFER", "PAYMENT"], required: false })
	@ApiQuery({ name: "categoryId", required: false, description: "Filter by category" })
	@ApiQuery({
		name: "bankId",
		required: false,
		description: "Filter by accounts belonging to this bank",
	})
	@ApiQuery({
		name: "search",
		required: false,
		description: "Partial case-insensitive search in description",
	})
	@ApiQuery({ name: "from", required: false, description: "Start date (ISO 8601)" })
	@ApiQuery({ name: "to", required: false, description: "End date (ISO 8601)" })
	@ApiQuery({ name: "page", required: false, description: "Page number (default 1)" })
	@ApiQuery({ name: "limit", required: false, description: "Items per page (default 50, max 100)" })
	@ApiQuery({
		name: "sortBy",
		enum: ["date", "amount", "createdAt"],
		required: false,
		description: "Sort field (default date)",
	})
	@ApiQuery({
		name: "order",
		enum: ["asc", "desc"],
		required: false,
		description: "Sort order (default desc)",
	})
	@ApiResponse({
		status: 200,
		description: "Returns paginated transactions",
		type: ApiSuccessResponseDto<PaginatedResponseDto<TransactionResponseDto>>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findAll(@CurrentUser() profile: Profile, @Query() query: QueryTransactionsDto) {
		return this.transactionsService.findAllByProfile(profile.id, {
			accountId: query.accountId,
			type: query.type,
			categoryId: query.categoryId,
			bankId: query.bankId,
			search: query.search,
			from: query.from ? new Date(query.from) : undefined,
			to: query.to ? new Date(query.to) : undefined,
			page: query.page,
			limit: query.limit,
			sortBy: query.sortBy,
			order: query.order,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a single transaction by ID" })
	@ApiResponse({
		status: 200,
		description: "Returns the transaction",
		type: ApiSuccessResponseDto<TransactionResponseDto>,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Transaction not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async findOne(@Param("id") id: string, @CurrentUser() profile: Profile) {
		return this.transactionsService.findOne(id, profile.id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new transaction (automatically updates account balances)" })
	@ApiResponse({
		status: 201,
		description: "Returns the created transaction",
		type: ApiSuccessResponseDto<TransactionResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description:
			"Validation error or invalid transaction rules (destination account, category type mismatch)",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({
		status: 404,
		description: "Account or category not found",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async create(@CurrentUser() profile: Profile, @Body() dto: CreateTransactionDto) {
		return this.transactionsService.create(profile.id, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a transaction (reverses old balance, applies new)" })
	@ApiResponse({
		status: 200,
		description: "Returns the updated transaction",
		type: ApiSuccessResponseDto<TransactionResponseDto>,
	})
	@ApiResponse({
		status: 400,
		description: "Validation error or invalid request data",
		type: ApiErrorResponseDto,
	})
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Transaction not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async update(
		@Param("id") id: string,
		@CurrentUser() profile: Profile,
		@Body() dto: UpdateTransactionDto,
	) {
		return this.transactionsService.update(id, profile.id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a transaction (reverses balance effect)" })
	@ApiResponse({ status: 200, description: "Transaction deleted", type: ApiMessageResponseDto })
	@ApiResponse({ status: 401, description: "Unauthorized", type: ApiErrorResponseDto })
	@ApiResponse({ status: 404, description: "Transaction not found", type: ApiErrorResponseDto })
	@ApiResponse({ status: 500, description: "Internal server error", type: ApiErrorResponseDto })
	async remove(@Param("id") id: string, @CurrentUser() profile: Profile) {
		await this.transactionsService.remove(id, profile.id);
		return { message: "Transaction deleted" };
	}
}
