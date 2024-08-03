import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PayLoad } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		private jwtSvc: JwtService,
		private reflector: Reflector,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('JWT_SECRET'),
			ignoreExpiration: false,
		});
	}

	async validate(payload: PayLoad) {
		const { id } = payload,
			user = await this.usrSvc.find({ where: { id: id } });

		if (user) return true;

		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
