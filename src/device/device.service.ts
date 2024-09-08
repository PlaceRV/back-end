import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'auth/auth.service';
import {
	DeepPartial,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { User } from 'user/user.entity';
import { hash } from 'utils';
import { Device } from './device.entity';

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(Device) private repo: Repository<Device>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
		@Inject(forwardRef(() => AuthService))
		private authSvc: AuthService,
	) {}
	// session secret
	private readonly scr = this.cfgSvc.get('REFRESH_SECRET');
	private readonly exp = this.cfgSvc.get('REFRESH_EXPIRE');
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	refreshTokenSign(id: string) {
		return this.jwtSvc.sign(
			{ id },
			{
				secret: this.scr,
				expiresIn: this.exp,
			},
		);
	}

	async getTokens(user: User, mtdt: string) {
		const session = await this.save({
				owner: user,
				hashedUserAgent: hash(mtdt.toString()),
				useTimeLeft: this.use,
			}),
			refreshToken = this.refreshTokenSign(session.id),
			accessToken = this.jwtSvc.sign({ id: user.id });

		return new UserRecieve({ accessToken, refreshToken });
	}

	// Database requests
	find(options?: FindOptionsWhere<Device>): Promise<Device[]> {
		return this.repo.find({ where: options, relations: ['owner'] });
	}

	findOne(options?: FindOptionsWhere<Device>): Promise<Device> {
		return this.repo.findOne({ where: options, relations: ['owner'] });
	}

	save(entities: DeepPartial<Device>, options?: SaveOptions) {
		return this.repo.save(entities, options) as Promise<Device>;
	}

	delete(criteria: FindOptionsWhere<Device>) {
		return this.repo.delete(criteria);
	}
}
