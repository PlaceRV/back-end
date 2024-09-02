import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { DeviceService } from 'device/device.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayLoad } from '../auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	constructor(
		cfgSvc: ConfigService,
		private dvcSvc: DeviceService,
		private jwtSvc: JwtService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: cfgSvc.get('REFRESH_SECRET'),
		});
	}

	async validate(payload: PayLoad) {
		const session = await this.dvcSvc.findOne({ id: payload.id });
		if (session) {
			if (session.useTimeLeft - 1 > 0) {
				await this.dvcSvc.save({
					id: session.id,
					useTimeLeft: session.useTimeLeft - 1,
				});
				return {
					success: true,
					id: session.id,
					ua: session.hashedUserAgent,
					acsTkn: this.jwtSvc.sign(new PayLoad(session.owner.id).toPlainObj()),
					rfsTkn: this.dvcSvc.refreshTokenSign(
						new PayLoad(payload.id).toPlainObj(),
					),
				};
			} else {
				await this.dvcSvc.delete({ id: session.id });
				return { success: false, userId: session.owner.id };
			}
		}
		throw new UnauthorizedException('Invalid refresh token');
	}
}
