import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, EncryptionService, UserMetadata } from './auth.service';
import { IncomingMessage } from 'http';
import { Response } from 'express';
import { CookieOptions } from 'express';
import { UserRecieve } from 'src/device/device.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authSvc: AuthService,
		private crptSvc: EncryptionService,
	) {}

	async sendBack(res: Response, usrRcv: UserRecieve) {
		const [hdr, pld, sig] = usrRcv.token.split('.'),
			sessId = this.crptSvc.encrypt(usrRcv.sessId, sig),
			ckiProp: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' };

		res
			.cookie('signature', sig, ckiProp)
			.cookie('sessId', sessId, ckiProp)
			.send({ header: hdr, payload: pld });
	}

	@Post('login')
	async login(
		@Req() req: IncomingMessage,
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		this.sendBack(res, await this.authSvc.login(loginDto, new UserMetadata(req)));
	}

	@Post('signup')
	async signup(
		@Req() req: IncomingMessage,
		@Body() signupDto: SignUpDto,
		@Res({ passthrough: true }) res: Response,
	) {
		this.sendBack(res, await this.authSvc.signUp(signupDto, new UserMetadata(req)));
	}
}
