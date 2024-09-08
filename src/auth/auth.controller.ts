import {
	Body,
	Controller,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { compareSync } from 'bcrypt';
import { DeviceService } from 'device/device.service';
import { CookieOptions, Request, Response } from 'express';
import { UserRecieve } from 'user/user.class';
import { ILogin, ISignUp } from 'user/user.model';
import { hash } from 'utils/utils';
import { MetaData } from './auth.guard';
import { AuthService } from './auth.service';

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
	private readonly ckiPfx = this.cfgSvc.get('SERVER_COOKIE_PREFIX');
	private readonly rfsKey = this.cfgSvc.get('REFRESH_KEY');
	private readonly acsKey = this.cfgSvc.get('ACCESS_KEY');

	clearCookies(request: Request, response: Response, acs = true, rfs = true) {
		for (const cki in request.cookies)
			if (
				(compareSync(this.acsKey, cki.substring(this.ckiPfx.length)) && acs) ||
				(compareSync(this.rfsKey, cki.substring(this.ckiPfx.length)) && rfs)
			)
				response.clearCookie(cki, this.ckiOpt);
		response.status(HttpStatus.ACCEPTED);
	}

	sendBack(request: Request, response: Response, usrRcv: UserRecieve): boolean {
		try {
			this.clearCookies(request, response);
			response
				.cookie(
					this.ckiPfx + hash(this.acsKey),
					this.authSvc.encrypt(usrRcv.accessToken),
					this.ckiOpt,
				)
				.cookie(
					this.ckiPfx + hash(this.rfsKey),
					this.authSvc.encrypt(
						usrRcv.refreshToken,
						usrRcv.accessToken.split('.')[2],
					),
					this.ckiOpt,
				)
				.status(HttpStatus.ACCEPTED);
			return true;
		} catch (error) {
			response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
		}
	}

	@Post('login')
	async login(
		@Req() request: Request,
		@Body() body: ILogin,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.authSvc.login(body, mtdt),
		);
	}

	@Post('signup')
	async signUp(
		@Req() request: Request,
		@Body() body: ISignUp,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.authSvc.signUp(body, mtdt),
		);
	}

	@Post('logout')
	@UseGuards(AuthGuard('refresh'))
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		this.clearCookies(request, response);
		await this.dvcSvc.remove(request.user['id']);
	}

	@Post('refresh')
	@UseGuards(AuthGuard('refresh'))
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		const sendBack = (usrRcv: UserRecieve) =>
			this.sendBack(request, response, usrRcv);
		if (request.user['success'] && compareSync(mtdt, request.user['ua'])) {
			sendBack(
				new UserRecieve({
					accessToken: request.user['acsTkn'],
					refreshToken: request.user['rfsTkn'],
				}),
			);
		} else sendBack(await this.dvcSvc.getTokens(request.user['userId'], mtdt));
	}
}
