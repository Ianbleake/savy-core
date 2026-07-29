import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ─── Types (for code consumers) ───────────────────────────────────────

export type AccountDistributionType = "DEBIT" | "CREDIT" | "LOAN" | "CASH";
export type TransactionKind = "INCOME" | "EXPENSE" | "TRANSFER" | "PAYMENT";

export interface NetWorthSummary {
	total: number;
	assets: number;
	liabilities: number;
	currency: string;
	monthDelta: number | null;
}

export interface AccountDistribution {
	type: AccountDistributionType;
	count: number;
	totalBalance: number;
	percentage: number;
}

export interface RecentTransaction {
	id: string;
	type: TransactionKind;
	amount: number;
	description: string | null;
	date: string;
	accountName: string;
	categoryName: string | null;
}

export interface ActiveBudget {
	id: string;
	categoryName: string;
	spent: number;
	budget: number;
	percentage: number;
	remaining: number;
}

export interface SavingsGoalSummary {
	id: string;
	name: string;
	currentAmount: number;
	targetAmount: number;
	percentage: number;
	deadline: string | null;
	isCompleted: boolean;
}

export interface CreditCardSummary {
	id: string;
	creditLimit: number;
	available: number;
	nextPaymentDue: string | null;
	minPayment: number | null;
}

export interface LoanSummary {
	id: string;
	principal: number;
	remaining: number;
	monthlyPayment: number;
	nextPaymentDue: string | null;
}

export interface CreditOverview {
	creditCards: CreditCardSummary[];
	loans: LoanSummary[];
}

export interface BankSummary {
	id: string;
	name: string;
	color: string | null;
	logo: string | null;
	accountCount: number;
}

export interface DashboardSummary {
	netWorth: NetWorthSummary;
	accountsDistribution: AccountDistribution[];
	recentTransactions: RecentTransaction[];
	activeBudgets: ActiveBudget[];
	savingsGoals: SavingsGoalSummary[];
	creditOverview: CreditOverview;
	banks: BankSummary[];
	generatedAt: string;
}

// ─── Swagger DTOs ─────────────────────────────────────────────────────

class NetWorthSummaryDto implements NetWorthSummary {
	@ApiProperty({ example: 125000, description: "Net worth (assets - liabilities)" })
	total!: number;

	@ApiProperty({ example: 180000, description: "Sum of asset account balances" })
	assets!: number;

	@ApiProperty({
		example: 55000,
		description: "Sum of liability account balances (absolute value)",
	})
	liabilities!: number;

	@ApiProperty({ example: "MXN", description: "Profile currency code" })
	currency!: string;

	@ApiPropertyOptional({
		example: null,
		description: "Month-over-month delta (reserved, currently null)",
	})
	monthDelta!: number | null;
}

class AccountDistributionDto implements AccountDistribution {
	@ApiProperty({
		enum: ["DEBIT", "CREDIT", "LOAN", "CASH"],
		example: "DEBIT",
		description: "Account type",
	})
	type!: AccountDistributionType;

	@ApiProperty({ example: 3, description: "Number of active accounts of this type" })
	count!: number;

	@ApiProperty({ example: 80000, description: "Sum of balances (absolute) for this type" })
	totalBalance!: number;

	@ApiProperty({ example: 64, description: "Percentage of total absolute balances (0-100)" })
	percentage!: number;
}

class RecentTransactionDto implements RecentTransaction {
	@ApiProperty({ example: "tx-uuid", description: "Transaction ID" })
	id!: string;

	@ApiProperty({ enum: ["INCOME", "EXPENSE", "TRANSFER", "PAYMENT"], example: "EXPENSE" })
	type!: TransactionKind;

	@ApiProperty({ example: 1500, description: "Transaction amount" })
	amount!: number;

	@ApiPropertyOptional({ example: "Grocery shopping", description: "Description (may be null)" })
	description!: string | null;

	@ApiProperty({ example: "2026-07-29T12:00:00.000Z", description: "Transaction date (ISO)" })
	date!: string;

	@ApiProperty({ example: "Checking Account", description: "Name of the source account" })
	accountName!: string;

	@ApiPropertyOptional({ example: "Groceries", description: "Category name (may be null)" })
	categoryName!: string | null;
}

class ActiveBudgetDto implements ActiveBudget {
	@ApiProperty({ example: "budget-uuid", description: "Budget ID" })
	id!: string;

	@ApiProperty({ example: "Groceries", description: "Category name" })
	categoryName!: string;

	@ApiProperty({ example: 3200, description: "Amount spent in the current cycle" })
	spent!: number;

	@ApiProperty({ example: 5000, description: "Budget amount" })
	budget!: number;

	@ApiProperty({ example: 64, description: "Percentage of budget used (0-100+)" })
	percentage!: number;

	@ApiProperty({ example: 1800, description: "Remaining budget (budget - spent)" })
	remaining!: number;
}

class SavingsGoalSummaryDto implements SavingsGoalSummary {
	@ApiProperty({ example: "goal-uuid", description: "Savings goal ID" })
	id!: string;

	@ApiProperty({ example: "Viaje a Europa", description: "Savings goal name" })
	name!: string;

	@ApiProperty({ example: 12500, description: "Current amount saved (account balance)" })
	currentAmount!: number;

	@ApiProperty({ example: 50000, description: "Target amount to save" })
	targetAmount!: number;

	@ApiProperty({ example: 25, description: "Progress percentage (0-100)" })
	percentage!: number;

	@ApiPropertyOptional({
		example: "2026-12-31T00:00:00.000Z",
		description: "Deadline (ISO) or null",
	})
	deadline!: string | null;

	@ApiProperty({ example: false, description: "Whether the goal is completed" })
	isCompleted!: boolean;
}

class CreditCardSummaryDto implements CreditCardSummary {
	@ApiProperty({ example: "card-uuid", description: "Credit card ID" })
	id!: string;

	@ApiProperty({ example: 50000, description: "Credit limit" })
	creditLimit!: number;

	@ApiProperty({ example: 35000, description: "Available credit (limit - used, floored at 0)" })
	available!: number;

	@ApiPropertyOptional({
		example: "2026-08-25T00:00:00.000Z",
		description: "Next payment due date (ISO) or null",
	})
	nextPaymentDue!: string | null;

	@ApiPropertyOptional({
		example: 750,
		description: "Minimum payment from latest statement or null",
	})
	minPayment!: number | null;
}

class LoanSummaryDto implements LoanSummary {
	@ApiProperty({ example: "loan-uuid", description: "Loan ID" })
	id!: string;

	@ApiProperty({ example: 200000, description: "Loan principal amount" })
	principal!: number;

	@ApiProperty({ example: 185000, description: "Remaining balance" })
	remaining!: number;

	@ApiProperty({ example: 6800, description: "Monthly payment amount" })
	monthlyPayment!: number;

	@ApiPropertyOptional({
		example: null,
		description: "Next payment due date (reserved, currently null)",
	})
	nextPaymentDue!: string | null;
}

class CreditOverviewDto implements CreditOverview {
	@ApiProperty({ type: [CreditCardSummaryDto], description: "Credit cards overview" })
	creditCards!: CreditCardSummaryDto[];

	@ApiProperty({ type: [LoanSummaryDto], description: "Loans overview" })
	loans!: LoanSummaryDto[];
}

class BankSummaryDto implements BankSummary {
	@ApiProperty({ example: "bank-uuid", description: "Bank ID" })
	id!: string;

	@ApiProperty({ example: "BBVA", description: "Bank display name" })
	name!: string;

	@ApiPropertyOptional({ example: "#0d9488", description: "UI color or null" })
	color!: string | null;

	@ApiPropertyOptional({ example: "bbva-logo", description: "Logo identifier or null" })
	logo!: string | null;

	@ApiProperty({ example: 3, description: "Number of active accounts linked to this bank" })
	accountCount!: number;
}

export class DashboardSummaryDto implements DashboardSummary {
	@ApiProperty({ type: NetWorthSummaryDto, description: "Net worth summary" })
	netWorth!: NetWorthSummaryDto;

	@ApiProperty({
		type: [AccountDistributionDto],
		description: "Distribution of active accounts by type",
	})
	accountsDistribution!: AccountDistributionDto[];

	@ApiProperty({ type: [RecentTransactionDto], description: "5 most recent transactions" })
	recentTransactions!: RecentTransactionDto[];

	@ApiProperty({ type: [ActiveBudgetDto], description: "Top 4 active budgets by usage percentage" })
	activeBudgets!: ActiveBudgetDto[];

	@ApiProperty({
		type: [SavingsGoalSummaryDto],
		description: "Top 4 savings goals (incomplete first)",
	})
	savingsGoals!: SavingsGoalSummaryDto[];

	@ApiProperty({ type: CreditOverviewDto, description: "Credit cards and loans overview" })
	creditOverview!: CreditOverviewDto;

	@ApiProperty({ type: [BankSummaryDto], description: "Banks grouped by account count" })
	banks!: BankSummaryDto[];

	@ApiProperty({
		example: "2026-07-29T12:00:00.000Z",
		description: "Summary generation timestamp (ISO)",
	})
	generatedAt!: string;
}
