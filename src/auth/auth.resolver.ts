import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto, UserMetadata, UserRecieve } from './auth.dto';
import { Headers, Req } from '@nestjs/common';

@Resolver()
export class AuthResolver {
	constructor(private readonly authSvc: AuthService) {}

	// Mutations
	@Mutation(() => UserRecieve)
	signUp(@Args('signUpDto') signupDto: SignUpDto, @Req() req, @Headers() headers) {
		return this.authSvc.signUp(signupDto);
	}

	@Mutation(() => UserRecieve)
	login(@Args('loginDto') loginDto: LoginDto, @Req() req, @Headers() headers) {
		return this.authSvc.login(loginDto, new UserMetadata(req, headers));
	}
}
