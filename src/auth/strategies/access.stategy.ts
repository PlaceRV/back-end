import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { PayLoad } from '../auth.service';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	async validate(payload: PayLoad) {
		const user = await this.usrSvc.findOne({ id: payload.id });
		if (user) return user;
		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
