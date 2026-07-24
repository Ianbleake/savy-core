import { Injectable, NotFoundException } from "@nestjs/common";
import type { Profile } from "../generated/prisma/client";
import type { PrismaService } from "../prisma/prisma.service";

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
	createdAt: Date;
	updatedAt: Date;
}

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
}
