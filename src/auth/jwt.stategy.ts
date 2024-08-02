import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		private jwtSvc: JwtService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('JWT_SECRET'),
			ignoreExpiration: false,
		});
	}

	async validate(payload: any) {
		const { id } = payload,
			user = await this.usrSvc.find({
				where: {
					id: id,
				},
			});

		if (user) return user;

		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
