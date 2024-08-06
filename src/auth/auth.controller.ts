import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { AuthService, UserMetadata } from './auth.service';
import { Request, Response } from 'express';
import { CookieOptions } from 'express';
import { DeviceService, UserRecieve } from 'src/device/device.service';
import { compareSync } from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(
		private authSvc: AuthService,
		private dvcSvc: DeviceService,
	) {}
	private readonly ckiProp: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};

	clearCookies(req: Request, res: Response, access = true, refresh = true) {
		for (const cki in req.cookies)
			if (compareSync('access', cki) && access) res.clearCookie(cki, this.ckiProp);
			else if (compareSync('refresh', cki) && refresh)
				res.clearCookie(cki, this.ckiProp);
	}

	async sendBack(req: Request, res: Response, usrRcv: UserRecieve) {
		this.clearCookies(req, res);
		res
			.cookie(
				this.authSvc.hash('access'),
				this.authSvc.encrypt(usrRcv.accessToken),
				this.ckiProp,
			)
			.cookie(
				this.authSvc.hash('refresh'),
				this.authSvc.encrypt(usrRcv.refreshToken),
				this.ckiProp,
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
	@UseGuards(AuthGuard('refresh'))
	async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		if (req.user['success']) {
			if (compareSync(new UserMetadata(req).toString(), req.user['ua'])) {
				this.clearCookies(req, res, true, false);
				res.cookie(
					this.authSvc.hash('access'),
					this.authSvc.encrypt(req.user['tkn']),
					this.ckiProp,
				);
				return;
			}
		} else
			await this.sendBack(
				req,
				res,
				await this.dvcSvc.handleDeviceSession(
					req.user['userId'],
					new UserMetadata(req),
				),
			);
		throw new BadRequestException('Invalid refresh token');
	}
}
