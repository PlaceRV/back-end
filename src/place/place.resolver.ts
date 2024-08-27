import { CurrentUser, RoleGuard, Roles } from '@backend/auth/auth.guard';
import { Role, User } from '@backend/user/user.entity';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PlaceAssign } from './place.dto';
import { Place } from './place.entity';
import { PlaceService } from './place.service';

@Resolver(() => Place)
@UseGuards(RoleGuard)
export class PlaceResolver {
	constructor(private plcSvc: PlaceService) {}

	// Queries
	@Mutation(() => Boolean)
	@Roles([Role.STAFF])
	async createPlace(
		@CurrentUser() user: User,
		@Args('assignPlace') input: PlaceAssign,
	) {
		return Boolean(this.plcSvc.assign(input, user));
	}
}
