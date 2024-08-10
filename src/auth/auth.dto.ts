import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SignUpDto {
	@IsString() @Field({ nullable: false }) firstName!: string;
	@IsString() @Field({ nullable: false }) lastName!: string;
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}

@InputType()
export class LogInDto {
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}
