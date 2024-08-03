import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SignUpDto {
	@IsString() @Field({ nullable: false }) firstName!: string;
	@IsString() @Field({ nullable: false }) lastName!: string;
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}

@InputType()
export class LoginDto {
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}

@ObjectType()
export class UserRecieve {
	constructor(token: string) {
		this.token = token!;
	}
	@Field() token: string;
	@Field() refreshToken: string;
}
