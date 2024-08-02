import { Resolver, Query, Args } from '@nestjs/graphql';
import { Role, User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolv {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@UseGuards(AuthGuard)
	findOne(@Args('id') id: string) {
		return this.usrSvc.find({ where: { id: id } });
	}

	@Query(() => [User])
	@UseGuards(AuthGuard)
	@Roles(Role.ADMIN, Role.USER)
	findAll() {
		return this.usrSvc.find();
	}
}
