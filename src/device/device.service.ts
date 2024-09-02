import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService, PayLoad, UserMetadata } from 'auth/auth.service';
import {
	DeepPartial,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { UserRecieve } from 'user/user.dto';
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

	refreshTokenSign(payload: PayLoad) {
		return this.jwtSvc.sign(payload, {
			secret: this.scr,
			expiresIn: this.exp,
		});
	}

	async getTokens(user: User, mtdt: UserMetadata) {
		const session = await this.save({
				owner: user,
				hashedUserAgent: hash(mtdt.toString()),
				useTimeLeft: this.use,
			}),
			refreshToken = this.refreshTokenSign(
				new PayLoad(session.id).toPlainObj(),
			),
			accessToken = this.jwtSvc.sign(new PayLoad(user.id).toPlainObj());

		return new UserRecieve({ accessToken, refreshToken });
	}

	// Database requests
	find(options?: FindOptionsWhere<Device>): Promise<Device[]> {
		return this.repo.find({ where: options, relations: ['owner'] });
	}

	findOne(options?: FindOptionsWhere<Device>): Promise<Device> {
		return this.repo.findOne({ where: options, relations: ['owner'] });
	}

	save(
		entities: DeepPartial<Device>,
		options?: SaveOptions & { reload: false },
	) {
		return this.repo.save(entities, options) as Promise<Device>;
	}

	delete(criteria: FindOptionsWhere<Device>) {
		return this.repo.delete(criteria);
	}
}
