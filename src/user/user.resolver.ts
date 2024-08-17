import { Resolver, Query, Args } from '@nestjs/graphql';
import { Role, User } from './user.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { AllowPublic, RoleGuard, Roles } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Resolver(() => User)
@UseGuards(RoleGuard)
export class UserResolver {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@AllowPublic(true)
	async findOne(@Args('id') id: string) {
		const user = await this.usrSvc.findOne({ id });
		if (user) return user;
		throw new BadRequestException('User not found');
	}

	@Query(() => [User])
	@Roles([Role.ADMIN, Role.USER])
	findAll() {
		return this.usrSvc.find();
	}
}
