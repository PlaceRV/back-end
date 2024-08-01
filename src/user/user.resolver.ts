import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserInput } from './user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  // Queries
  @Query(() => User)
  findOne(@Args('id') id: string) {
    return this.service.findOne(id);
  }

  @Query(() => [User])
  findAll() {
    return this.service.findAll();
  }

  // Mutations
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.service.create(createUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id') id: string) {
    return this.service.remove(id);
  }
}
