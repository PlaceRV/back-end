import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthSvc } from './auth.service';
import { LoginDto, SignUpDto, UserRecieve } from './auth.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authSvc: AuthSvc) {}

  // Mutations
  @Mutation(() => UserRecieve)
  signUp(@Args('signUpDto') signupDto: SignUpDto) {
    return this.authSvc.signUp(signupDto);
  }

  @Mutation(() => UserRecieve)
  login(@Args('loginDto') loginDto: LoginDto) {
    return this.authSvc.login(loginDto);
  }
}
