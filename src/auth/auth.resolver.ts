import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GqlContext, LoginDto, SignUpDto, UserMetadata, UserRecieve } from './auth.dto';

@Resolver()
export class AuthResolver {
	constructor(private readonly authSvc: AuthService) {}

	// Mutations
	@Mutation(() => UserRecieve)
	signUp(@Args('signUpDto') signupDto: SignUpDto, @Context() ctx: GqlContext) {
		return this.authSvc.signUp(signupDto);
	}

	@Mutation(() => UserRecieve)
	login(@Args('loginDto') loginDto: LoginDto, @Context() ctx: GqlContext) {
		return this.authSvc.login(loginDto, new UserMetadata(ctx));
	}
}
