import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, UserMetadata } from './auth.service';
import { IncomingMessage } from 'http';
import { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
	constructor(private readonly authSvc: AuthService) {}

	@Post('login')
	async login(@Req() req: IncomingMessage, @Body() loginDto: LoginDto) {
		return this.authSvc.login(loginDto, new UserMetadata(req));
	}

	@Post('signup')
	async signup(
		@Req() req: IncomingMessage,
		@Res({ passthrough: true }) res: FastifyReply,
		@Body() signupDto: SignUpDto,
	) {
		return this.authSvc.signUp(signupDto, new UserMetadata(req));
	}
}
