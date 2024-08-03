import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { PayLoad } from '../auth.service';
import ms from 'ms';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(
		private usrSvc: UserService,
		private cfgSvc: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: cfgSvc.get('JWT_REFRESH_SECRET'),
		});
	}

	async validate(payload: PayLoad) {
		const user = await this.usrSvc.findOne({ where: { id: payload.id } });
		if (user)
			return {
				user: user,
				rfshTknExpAt: new Date(ms(payload.rfshTknExpAt)),
			};
		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
