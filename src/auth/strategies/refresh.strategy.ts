import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { DeviceService } from 'device/device.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionService } from 'session/session.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	constructor(
		cfgSvc: ConfigService,
		private sesSvc: SessionService,
		private jwtSvc: JwtService,
		private dvcSvc: DeviceService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: cfgSvc.get('REFRESH_SECRET'),
		});
	}

	async validate(payload: IPayload) {
		const session = await this.sesSvc.id(payload.id);
		if (session) {
			if (session.useTimeLeft - 1 >= 0) {
				await this.sesSvc.update(session.id);
				return {
					success: true,
					id: session.id,
					ua: session.device.hashedUserAgent,
					acsTkn: this.jwtSvc.sign({ id: session.device.owner.id }),
					rfsTkn: this.dvcSvc.refreshTokenSign(payload.id),
				};
				// Todo: Cập nhật logic refresh token
			} else return { success: false, userId: session.device.owner.id };
		}
		throw new UnauthorizedException('Invalid refresh token');
	}
}
