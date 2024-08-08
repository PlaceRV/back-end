import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { DeepPartial, FindOneOptions, FindOptionsWhere, Repository, SaveOptions } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService, PayLoad, UserMetadata } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';

export class UserRecieve {
	constructor(tkn: string, rfshTkn: string) {
		this.accessToken = tkn;
		this.refreshToken = rfshTkn;
	}
	accessToken: string;
	refreshToken: string;
}

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
		@Inject(forwardRef(() => AuthService))
		private authSvc: AuthService,
	) {}
	// session secret
	private readonly scr = this.cfgSvc.get('SERVER_SECRET');
	private readonly exp = this.cfgSvc.get('REFRESH_EXPIRE');
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	refreshTokenSign(payload: Object) {
		return this.jwtSvc.sign(payload, {
			secret: this.scr,
			expiresIn: this.exp,
		});
	}

	async getTokens(usrId: string, mtdt: UserMetadata) {
		const session = await this.save({
				userId: usrId,
				hashedUserAgent: this.authSvc.hash(mtdt.toString()),
				useTimeLeft: this.use,
			}),
			rfshTkn = this.refreshTokenSign(new PayLoad(session.id).toPlainObj()),
			tkn = this.jwtSvc.sign(new PayLoad(usrId).toPlainObj());

		return new UserRecieve(tkn, rfshTkn);
	}

	findOne(options?: FindOneOptions<DeviceSession>) {
		return this.repo.findOne(options);
	}

	save(entities: DeepPartial<DeviceSession>, options?: SaveOptions & { reload: false }) {
		return this.repo.save(entities, options);
	}

	delete(criteria: FindOptionsWhere<DeviceSession>) {
		return this.repo.delete(criteria);
	}
}
