import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleGuard, Roles } from 'auth/auth.guard';
import { User } from './user.entity';
import { Role } from './user.model';
import { UserService } from './user.service';

@Resolver(() => User)
@UseGuards(RoleGuard)
export class UserResolver {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@Roles([Role.USER])
	async findOne(@Args('id') id: string) {
		const user = await this.usrSvc.id(id);
		if (user) return user.info;
		throw new BadRequestException('User not found');
	}

	@Query(() => [User])
	@Roles([Role.ADMIN])
	async findAll() {
		return await this.usrSvc.all();
	}
}
