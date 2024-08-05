import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, EncryptionService, UserMetadata } from './auth.service';
import { IncomingMessage } from 'http';
import { Response } from 'express';
import { CookieOptions } from 'express';
import { UserRecieve } from 'src/device/device.service';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';

@Controller('auth')
export class AuthController {
	constructor(
		private authSvc: AuthService,
		private encryptSvc: EncryptionService,
		private cfgSvc: ConfigService,
	) {}

	async sendBack(req: IncomingMessage, res: Response, usrRcv: UserRecieve) {
		const ckiProp: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' },
			e = (s: string) => this.encryptSvc.encrypt(s, this.cfgSvc.get('SERVER_SECRET')),
			h = (s: string) => hash(s, this.cfgSvc.get('BCRYPT_SALT'));

		for (const cki in req['cookies']) {
			if ((await compare('access', cki)) || (await compare('refresh', cki)))
				res.clearCookie(cki, ckiProp);
		}

		res
			.cookie(await h('access'), e(usrRcv.accessToken), ckiProp)
			.cookie(await h('refresh'), e(usrRcv.refreshToken), ckiProp);
	}

	@Post('login')
	async login(
		@Req() req: IncomingMessage,
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.sendBack(
			req,
			res,
			await this.authSvc.login(loginDto, new UserMetadata(req)),
		);
	}

	@Post('signup')
	async signup(
		@Req() req: IncomingMessage,
		@Body() signupDto: SignUpDto,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.sendBack(
			req,
			res,
			await this.authSvc.signUp(signupDto, new UserMetadata(req)),
		);
	}

	@Post('refresh')
	async refresh(
		@Req() req: IncomingMessage,
		@Res({ passthrough: true }) res: Response,
	) {}
}
