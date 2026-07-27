import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Profile } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

interface CreateProfileData {
	authId: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
}

interface UpdateProfileData {
	firstName?: string;
	lastName?: string;
	secondLastName?: string;
	avatarUrl?: string | null;
	phone?: string | null;
	currency?: string;
	locale?: string;
	timezone?: string;
	monthlyIncome?: number | null;
	paydayOfMonth?: number | null;
}

export interface ProfileWithComputed {
	id: string;
	authId: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	secondLastName: string | null;
	fullName: string | null;
	initials: string | null;
	avatarUrl: string | null;
	phone: string | null;
	currency: string;
	locale: string;
	timezone: string;
	onboardingCompleted: boolean;
	monthlyIncome: number | null;
	paydayOfMonth: number | null;
	createdAt: Date;
	updatedAt: Date;
}

const ONBOARDING_REQUIRED_FIELDS = [
	"firstName",
	"lastName",
	"currency",
	"locale",
	"timezone",
	"monthlyIncome",
	"paydayOfMonth",
] as const;

@Injectable()
export class ProfilesService {
	constructor(private readonly prisma: PrismaService) {}

	async findByAuthId(authId: string): Promise<Profile | null> {
		return this.prisma.profile.findUnique({
			where: { authId },
		});
	}

	async findById(id: string): Promise<Profile | null> {
		return this.prisma.profile.findUnique({
			where: { id },
		});
	}

	async create(data: CreateProfileData): Promise<Profile> {
		return this.prisma.profile.create({
			data: {
				authId: data.authId,
				email: data.email,
				firstName: data.firstName ?? null,
				lastName: data.lastName ?? null,
			},
		});
	}

	async update(id: string, data: UpdateProfileData): Promise<Profile> {
		const profile = await this.prisma.profile.findUnique({ where: { id } });
		if (!profile) {
			throw new NotFoundException("Profile not found");
		}

		return this.prisma.profile.update({
			where: { id },
			data,
		});
	}

	withComputed(profile: Profile): ProfileWithComputed {
		return {
			id: profile.id,
			authId: profile.authId,
			email: profile.email,
			firstName: profile.firstName,
			lastName: profile.lastName,
			secondLastName: profile.secondLastName,
			fullName: this.computeFullName(profile),
			initials: this.computeInitials(profile),
			avatarUrl: profile.avatarUrl,
			phone: profile.phone,
			currency: profile.currency,
			locale: profile.locale,
			timezone: profile.timezone,
			onboardingCompleted: profile.onboardingCompleted,
			monthlyIncome: profile.monthlyIncome ? Number(profile.monthlyIncome) : null,
			paydayOfMonth: profile.paydayOfMonth,
			createdAt: profile.createdAt,
			updatedAt: profile.updatedAt,
		};
	}

	private computeFullName(profile: Profile): string | null {
		const parts = [profile.firstName, profile.lastName, profile.secondLastName].filter(Boolean);
		return parts.length > 0 ? parts.join(" ") : null;
	}

	private computeInitials(profile: Profile): string | null {
		const first = profile.firstName?.[0]?.toUpperCase();
		const last = profile.lastName?.[0]?.toUpperCase();
		if (!first && !last) return null;
		return [first, last].filter(Boolean).join("");
	}

	validateOnboarding(profile: Profile): { valid: boolean; missingFields: string[] } {
		const missingFields: string[] = [];

		for (const field of ONBOARDING_REQUIRED_FIELDS) {
			const value = profile[field];
			if (value === null || value === undefined || value === "") {
				missingFields.push(field);
			}
		}

		return {
			valid: missingFields.length === 0,
			missingFields,
		};
	}

	async completeOnboarding(profileId: string): Promise<Profile> {
		const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
		if (!profile) {
			throw new NotFoundException("Profile not found");
		}

		const { valid, missingFields } = this.validateOnboarding(profile);
		if (!valid) {
			throw new BadRequestException({
				message: "Onboarding requirements not met",
				missingFields,
			});
		}

		return this.prisma.profile.update({
			where: { id: profileId },
			data: { onboardingCompleted: true },
		});
	}
}
