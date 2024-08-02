import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('JWT_SECRET'),
		});
	}

	async validate(payload: { id: string }) {
		const { id } = payload,
			user = await this.usrSvc.find({
				where: {
					id: id,
				},
			});

		if (user) {
			return user;
		}
		throw new UnauthorizedException('Login first to access this endpoint.');
	}
}
