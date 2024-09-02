import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { User } from 'user/user.entity';
import { Role } from 'user/user.enum';
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
