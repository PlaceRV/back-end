import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly service: UserService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Queries
  @Query(() => User)
  findOne(@Args('id') id: string) {
    return this.userRepo.findOneBy({ id: id });
  }

  @Query(() => [User])
  findAll() {
    return this.userRepo.find();
  }

  // Mutations
}
