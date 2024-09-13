import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from 'session/session.service';
import { Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { User } from 'user/user.entity';
import { hash } from 'utils/auth.utils';
import { DatabaseRequests } from 'utils/typeorm.utils';
import { Device } from './device.entity';

@Injectable()
export class DeviceService extends DatabaseRequests<Device> {
	constructor(
		@InjectRepository(Device) repo: Repository<Device>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
		private sesSvc: SessionService,
	) {
		super(repo);
	}
	// session secret
	private readonly scr = this.cfgSvc.get('REFRESH_SECRET');
	private readonly exp = this.cfgSvc.get('REFRESH_EXPIRE');

	refreshTokenSign(id: string) {
		return this.jwtSvc.sign({ id }, { secret: this.scr, expiresIn: this.exp });
	}

	async getTokens(user: User, mtdt: string) {
		const device = await this.save({
				owner: user,
				hashedUserAgent: hash(mtdt.toString()),
				valid: true,
			}),
			session = await this.sesSvc.assign(device),
			refreshToken = this.refreshTokenSign(session.id),
			accessToken = this.jwtSvc.sign({ id: user.id });

		return new UserRecieve({ accessToken, refreshToken });
	}

	async remove(session_id: string) {
		const { id, sessions } = (await this.sesSvc.id(session_id)).device;
		await Promise.all(
			sessions.map(async (i) => await this.sesSvc.remove(i.id)),
		);
		return this.delete({ id });
	}
}
