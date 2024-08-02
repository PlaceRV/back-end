import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver(() => User)
export class UserResolv {
  constructor(
    private readonly service: UserService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Queries
  @Query(() => User)
  @UseGuards(AuthGuard)
  findOne(@Args('id') id: string) {
    return this.userRepo.findOneBy({ id: id });
  }

  @Query(() => [User])
  @UseGuards(AuthGuard)
  findAll() {
    return this.userRepo.find();
  }

  // Mutations
}
