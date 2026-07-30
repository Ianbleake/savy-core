import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export const BANK_SUMMARY_PERIODS = [
	"day",
	"week",
	"month",
	"other_month",
	"quarter",
	"semester",
	"year",
] as const;

export type BankSummaryPeriod = (typeof BANK_SUMMARY_PERIODS)[number];

// ─── Interfaces (return-type contract) ────────────────────────────────

export interface BankSummaryBank {
	id: string;
	name: string;
	color: string | null;
	logo: string | null;
	isActive: boolean;
}

export interface BankSummaryBalanceBreakdown {
	assets: number;
	liabilities: number;
}

export interface BankSummaryIncomeVsExpenses {
	income: number;
	expenses: number;
	period: string;
	periodLabel: string;
}

export interface BankSummaryTopCategory {
	categoryId: string;
	categoryName: string;
	amount: number;
	percentage: number;
}

export interface BankSummaryLoan {
	id: string;
	accountId: string;
	principal: number;
	interestRate: number;
	termMonths: number;
	startDate: string;
	monthlyPayment: number;
	remaining: number;
	progress: number;
	createdAt: string;
	updatedAt: string;
}

export interface BankSummary {
	bank: BankSummaryBank;
	netWorth: number;
	liquidity: number;
	debt: number;
	balanceBreakdown: BankSummaryBalanceBreakdown;
	incomeVsExpenses: BankSummaryIncomeVsExpenses;
	topCategories: BankSummaryTopCategory[];
	accounts: unknown[];
	creditCards: unknown[];
	loans: BankSummaryLoan[];
	currency: string;
}

// ─── Swagger DTOs ──────────────────────────────────────────────────────

class BankSummaryBankDto implements BankSummaryBank {
	@ApiProperty({ example: "bank-uuid", description: "Bank ID" })
	id!: string;

	@ApiProperty({ example: "BBVA", description: "Bank display name" })
	name!: string;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color or null" })
	color!: string | null;

	@ApiPropertyOptional({ example: "bbva-logo", description: "Logo identifier or null" })
	logo!: string | null;

	@ApiProperty({ example: true, description: "Whether the bank is active" })
	isActive!: boolean;
}

class BankSummaryBalanceBreakdownDto implements BankSummaryBalanceBreakdown {
	@ApiProperty({
		example: 180000,
		description: "Total assets in integer cents (positive balances across all accounts)",
	})
	assets!: number;

	@ApiProperty({
		example: 55000,
		description: "Total liabilities in integer cents (negative balances + loan remaining)",
	})
	liabilities!: number;
}

class BankSummaryIncomeVsExpensesDto implements BankSummaryIncomeVsExpenses {
	@ApiProperty({
		example: 50000,
		description: "Total income in the period, in integer cents",
	})
	income!: number;

	@ApiProperty({
		example: 32000,
		description: "Total expenses in the period, in integer cents",
	})
	expenses!: number;

	@ApiProperty({
		example: "2026-07",
		description: "Period identifier (depends on selected period)",
	})
	period!: string;

	@ApiProperty({
		example: "Julio 2026",
		description: "Human-readable period label in Spanish",
	})
	periodLabel!: string;
}

class BankSummaryTopCategoryDto implements BankSummaryTopCategory {
	@ApiProperty({ example: "cat-uuid", description: "Category ID" })
	categoryId!: string;

	@ApiProperty({ example: "Groceries", description: "Category name" })
	categoryName!: string;

	@ApiProperty({
		example: 15000,
		description: "Total amount spent in this category, in integer cents",
	})
	amount!: number;

	@ApiProperty({
		example: 47,
		description: "Percentage of total expenses (0-100), rounded",
	})
	percentage!: number;
}

class BankSummaryLoanDto implements BankSummaryLoan {
	@ApiProperty({ example: "loan-uuid", description: "Loan ID" })
	id!: string;

	@ApiProperty({ example: "acc-uuid", description: "Associated account ID" })
	accountId!: string;

	@ApiProperty({
		example: 20000000,
		description: "Loan principal in integer cents",
	})
	principal!: number;

	@ApiProperty({
		example: 0.165,
		description: "Annual interest rate as decimal (0.165 = 16.5%)",
	})
	interestRate!: number;

	@ApiProperty({ example: 36, description: "Loan term in months" })
	termMonths!: number;

	@ApiProperty({ example: "2024-01-15T00:00:00.000Z", description: "Loan start date (ISO)" })
	startDate!: string;

	@ApiProperty({
		example: 680000,
		description: "Monthly payment amount in integer cents",
	})
	monthlyPayment!: number;

	@ApiProperty({
		example: 15000000,
		description: "Remaining balance in integer cents",
	})
	remaining!: number;

	@ApiProperty({
		example: 25,
		description: "Progress percentage paid (0-100), rounded",
	})
	progress!: number;

	@ApiProperty({ example: "2024-01-15T00:00:00.000Z", description: "Creation date (ISO)" })
	createdAt!: string;

	@ApiProperty({ example: "2026-07-29T00:00:00.000Z", description: "Last update date (ISO)" })
	updatedAt!: string;
}

export class BankSummaryResponseDto implements BankSummary {
	@ApiProperty({ type: BankSummaryBankDto, description: "Bank basic info" })
	bank!: BankSummaryBankDto;

	@ApiProperty({
		example: 125000,
		description: "Net worth in integer cents (assets - liabilities, debt negative)",
	})
	netWorth!: number;

	@ApiProperty({
		example: 80000,
		description: "Liquidity in integer cents (DEBIT + CASH accounts with positive balance)",
	})
	liquidity!: number;

	@ApiProperty({
		example: 55000,
		description: "Total debt in integer cents (credit utilized + loan remaining)",
	})
	debt!: number;

	@ApiProperty({
		type: BankSummaryBalanceBreakdownDto,
		description: "Balance breakdown in cents",
	})
	balanceBreakdown!: BankSummaryBalanceBreakdownDto;

	@ApiProperty({
		type: BankSummaryIncomeVsExpensesDto,
		description: "Income vs expenses for the selected period (cents)",
	})
	incomeVsExpenses!: BankSummaryIncomeVsExpensesDto;

	@ApiProperty({
		type: [BankSummaryTopCategoryDto],
		description: "Top 5 expense categories by amount (cents)",
	})
	topCategories!: BankSummaryTopCategoryDto[];

	@ApiProperty({
		type: [Object],
		description: "Raw Prisma Account entities (Decimal preserved) linked to this bank",
	})
	accounts!: unknown[];

	@ApiProperty({
		type: [Object],
		description: "Raw CreditCard entities (Decimal preserved) extracted from bank accounts",
	})
	creditCards!: unknown[];

	@ApiProperty({
		type: [BankSummaryLoanDto],
		description: "Loans with computed progress and amounts in integer cents",
	})
	loans!: BankSummaryLoanDto[];

	@ApiProperty({ example: "MXN", description: "Profile currency code" })
	currency!: string;
}

// ─── Query DTO ─────────────────────────────────────────────────────────

export class QueryBankSummaryDto {
	@ApiPropertyOptional({
		enum: BANK_SUMMARY_PERIODS,
		default: "month",
		description: "Aggregation period for income vs expenses. Defaults to month if omitted.",
	})
	@IsOptional()
	@IsString()
	period!: string;
}
