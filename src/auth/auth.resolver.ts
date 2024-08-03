import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService, GqlContext, UserMetadata } from './auth.service';
import { LoginDto, SignUpDto, UserRecieve } from './auth.dto';

@Resolver()
export class AuthResolver {
	constructor(private readonly authSvc: AuthService) {}

	// Mutations
	@Mutation(() => UserRecieve)
	signUp(@Args('signUpDto') signupDto: SignUpDto, @Context() ctx: GqlContext) {
		return this.authSvc.signUp(signupDto, new UserMetadata(ctx));
	}

	@Mutation(() => UserRecieve)
	login(@Args('loginDto') loginDto: LoginDto, @Context() ctx: GqlContext) {
		return this.authSvc.login(loginDto, new UserMetadata(ctx));
	}
}
