import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AllowPublic, CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { User } from 'user/user.entity';
import { Role } from 'user/user.model';
import { Place, PlaceAssign } from './place.entity';
import { PlaceService } from './place.service';

@Resolver(() => Place)
@UseGuards(RoleGuard)
export class PlaceResolver {
	constructor(private plcSvc: PlaceService) {}

	// Queries
	@Query(() => [Place])
	@AllowPublic(true)
	async placeAll() {
		return await this.plcSvc.all();
	}

	// Mutations
	@Mutation(() => Place)
	@Roles([Role.STAFF])
	async placeCreate(
		@CurrentUser() user: User,
		@Args('placeAssign') input: PlaceAssign,
	) {
		return (await this.plcSvc.assign(input, user)).info;
	}
}
