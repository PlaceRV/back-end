import { IUser } from '@backend/user/user.interface';
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SignUpDto implements Basic<IUser> {
	constructor(payload: Basic<IUser>) {
		Object.assign(this, payload);
	}

	@IsString() @Field({ nullable: false }) firstName: string;
	@IsString() @Field({ nullable: false }) lastName: string;
	@IsEmail() @Field({ nullable: false }) email: string;
	@IsNotEmpty() @Field({ nullable: false }) password: string;
}

@InputType()
export class LogInDto implements Pick<IUser, 'email' | 'password'> {
	constructor(payload: Pick<IUser, 'email' | 'password'>) {
		Object.assign(this, payload);
	}

	@IsEmail() @Field({ nullable: false }) email: string;
	@IsNotEmpty() @Field({ nullable: false }) password: string;
}
