import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, UserMetadata } from './auth.service';
import { Request, Response } from 'express';
import { CookieOptions } from 'express';
import { UserRecieve } from 'src/device/device.service';
import { compareSync } from 'bcrypt';

@Controller('auth')
export class AuthController {
	constructor(private authSvc: AuthService) {}

	async sendBack(req: Request, res: Response, usrRcv: UserRecieve) {
		const ckiProp: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' };

		for (const cki in req.cookies)
			if (compareSync('access', cki)) res.clearCookie(cki, ckiProp);
			else if (compareSync('refresh', cki)) res.clearCookie(cki, ckiProp);

		res
			.cookie(
				this.authSvc.hash('access'),
				this.authSvc.encrypt(usrRcv.accessToken),
				ckiProp,
			)
			.cookie(
				this.authSvc.hash('refresh'),
				this.authSvc.encrypt(usrRcv.refreshToken),
				ckiProp,
			);
	}

	@Post('login')
	async login(
		@Req() req: Request,
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.sendBack(
			req,
			res,
			await this.authSvc.login(dto, new UserMetadata(req)),
		);
	}

	@Post('signup')
	async signup(
		@Req() req: Request,
		@Body() dto: SignUpDto,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.sendBack(
			req,
			res,
			await this.authSvc.signUp(dto, new UserMetadata(req)),
		);
	}

	@Post('refresh')
	async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {}
}
