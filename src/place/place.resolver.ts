import { Roles } from '@backend/auth/auth.guard';
import { Role, User } from '@backend/user/user.entity';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlaceAssign } from './place.dto';
import { PlaceService } from './place.service';
import { InitClass } from '@backend/utils';

@Resolver()
export class PlaceResolver {
	constructor(private plcSvc: PlaceService) {}

	// Queries
	@UseGuards(AuthGuard('access'))
	@Roles([Role.STAFF])
	@Mutation()
	async create(@Req() req: Request, @Args('assignPlace') input: PlaceAssign) {
		this.plcSvc.assign(input, new User(req.user as InitClass<User>));
	}
}
