import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, UserMetadata as UsrMtdt } from './auth.service';
import { Request as Rqt, Response as Rsp } from 'express';
import { CookieOptions } from 'express';
import { DeviceService, UserRecieve } from 'src/device/device.service';
import { compareSync } from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
	constructor(
		private authSvc: AuthService,
		private dvcSvc: DeviceService,
		private cfgSvc: ConfigService,
	) {}
	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};

	clearCookies(req: Rqt, res: Rsp, access = true, refresh = true) {
		for (const cki in req.cookies)
			if (compareSync(this.cfgSvc.get('ACCESS'), cki) && access) res.clearCookie(cki, this.ckiOpt);
			else if (compareSync(this.cfgSvc.get('REFRESH'), cki) && refresh) res.clearCookie(cki, this.ckiOpt);
	}

	sendBack(req: Rqt, res: Rsp, usrRcv: UserRecieve) {
		this.clearCookies(req, res);
		res
			.cookie(
				this.authSvc.hash(this.cfgSvc.get('ACCESS')),
				this.authSvc.encrypt(usrRcv.accessToken),
				this.ckiOpt,
			)
			.cookie(
				this.authSvc.hash(this.cfgSvc.get('REFRESH')),
				this.authSvc.encrypt(usrRcv.refreshToken),
				this.ckiOpt,
			);
	}

	@Post('login')
	async login(@Req() req: Rqt, @Body() dto: LoginDto, @Res({ passthrough: true }) res: Rsp) {
		this.sendBack(req, res, await this.authSvc.login(dto, new UsrMtdt(req)));
	}

	@Post('signup')
	async signup(@Req() req: Rqt, @Body() dto: SignUpDto, @Res({ passthrough: true }) res: Rsp) {
		this.sendBack(req, res, await this.authSvc.signUp(dto, new UsrMtdt(req)));
	}

	@Post('refreshToken')
	@UseGuards(AuthGuard('refresh'))
	async refresh(@Req() req: Rqt, @Res({ passthrough: true }) res: Rsp) {
		if (req.user['success']) {
			if (compareSync(new UsrMtdt(req).toString(), req.user['ua'])) {
				this.clearCookies(req, res, true, false);
				res.cookie(
					this.authSvc.hash(this.cfgSvc.get('ACCESS')),
					this.authSvc.encrypt(req.user['tkn']),
					this.ckiOpt,
				);
			}
		} else this.sendBack(req, res, await this.dvcSvc.getTokens(req.user['userId'], new UsrMtdt(req)));
	}
}
