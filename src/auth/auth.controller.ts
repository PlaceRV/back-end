import { Body, Controller, Post, Req } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, UserMetadata } from './auth.service';
import { IncomingMessage } from 'http';

@Controller('auth')
export class AuthController {
	constructor(private readonly authSvc: AuthService) {}

	@Post('login')
	async login(@Req() req: IncomingMessage, @Body() loginDto: LoginDto) {
		return this.authSvc.login(loginDto, new UserMetadata(req));
	}

	@Post('signup')
	async signup(@Req() req: IncomingMessage, @Body() signupDto: SignUpDto) {
		return this.authSvc.signUp(signupDto, new UserMetadata(req));
	}
}
