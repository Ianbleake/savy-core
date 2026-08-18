import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { ApiErrorResponse, ApiSuccessResponse } from "../common/decorators/api-response.decorator";
import type { Profile } from "../generated/prisma/client";
import {
	OnboardingValidationResponseDto,
	ProfileResponseDto,
	UpdateProfileDto,
} from "./dto/profile.dto";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@ApiBearerAuth()
@Controller("profiles")
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@Get("me")
	@ApiOperation({ summary: "Get current user profile" })
	@ApiSuccessResponse(200, ProfileResponseDto, "Returns complete user profile with computed fields")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async getMyProfile(@CurrentUser() profile: Profile) {
		return await this.profilesService.withComputed(profile);
	}

	@Patch("me")
	@ApiOperation({ summary: "Update current user profile" })
	@ApiSuccessResponse(200, ProfileResponseDto, "Returns updated profile with computed fields")
	@ApiErrorResponse(400, "Validation error or invalid request data")
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async updateMyProfile(@CurrentUser() profile: Profile, @Body() dto: UpdateProfileDto) {
		const updated = await this.profilesService.update(profile.id, dto);
		return this.profilesService.withComputed(updated);
	}

	@Get("onboarding/validate")
	@ApiOperation({ summary: "Validate if all required onboarding fields are complete" })
	@ApiSuccessResponse(
		200,
		OnboardingValidationResponseDto,
		"Returns whether onboarding requirements are met and lists any missing fields",
	)
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async validateOnboarding(@CurrentUser() profile: Profile) {
		return this.profilesService.validateOnboarding(profile);
	}

	@Post("onboarding/complete")
	@ApiOperation({ summary: "Mark onboarding as completed after validating required fields" })
	@ApiSuccessResponse(
		200,
		ProfileResponseDto,
		"Onboarding completed successfully, returns updated profile",
	)
	@ApiErrorResponse(
		400,
		"Validation error or onboarding requirements not met (returns missing fields)",
	)
	@ApiErrorResponse(401, "Unauthorized")
	@ApiErrorResponse(500, "Internal server error")
	async completeOnboarding(@CurrentUser() profile: Profile) {
		const updated = await this.profilesService.completeOnboarding(profile.id);
		return this.profilesService.withComputed(updated);
	}
}
