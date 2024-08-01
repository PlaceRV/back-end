import { InputType, Field } from '@nestjs/graphql';

export class CreateUserDto {
  @Field({ nullable: false })
  firstName!: string;

  @Field({ nullable: false })
  lastName!: string;

  @Field({ nullable: false })
  email!: string;

  @Field({ nullable: false })
  password!: string;
}
