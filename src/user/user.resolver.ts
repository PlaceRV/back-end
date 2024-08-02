import { Resolver, Query, Args } from '@nestjs/graphql';
import { Role, User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { AllowPublic, AuthGuard, Roles } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolv {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@UseGuards(AuthGuard)
	@AllowPublic()
	async findOne(@Args('id') id: string) {
		return (await this.usrSvc.find({ where: { id: id } }))[0];
	}

	@Query(() => [User])
	@UseGuards(AuthGuard)
	@Roles(Role.ADMIN, Role.USER)
	findAll() {
		return this.usrSvc.find();
	}
}
