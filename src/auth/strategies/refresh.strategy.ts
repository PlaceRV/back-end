import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { PayLoad } from '../auth.service';
import ms from 'ms';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
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
		const user = await this.usrSvc.findOne({ where: { id: payload.usrId } });
		if (user) return { user: user };
		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
