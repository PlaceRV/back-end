import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { DeepPartial, FindOneOptions, Repository, SaveOptions } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { PayLoad, UserMetadata } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

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
	) {}
	// bcrypt
	private readonly slt = this.cfgSvc.get('BCRYPT_SALT');
	// jwt
	private readonly scr = this.cfgSvc.get('SERVER_SECRET');
	private readonly exp = this.cfgSvc.get('REFRESH_EXPIRE');
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	async handleDeviceSession(usrId: string, mtdt: UserMetadata): Promise<UserRecieve> {
		const session = await this.save({
				user: usrId,
				hashedUserAgent: await hash(mtdt.toString(), this.slt),
				useTimeLeft: this.use,
			}),
			rfshTkn = this.jwtSvc.sign(
				{ id: session.id },
				{ secret: this.scr, expiresIn: this.exp },
			),
			payload = new PayLoad(usrId),
			tkn = this.jwtSvc.sign(payload.toPlainObj());

		return new UserRecieve(tkn, rfshTkn);
	}

	findOne(options?: FindOneOptions<DeviceSession>): Promise<DeviceSession> {
		return this.repo.findOne(options);
	}

	save(
		entities: DeepPartial<DeviceSession>,
		options?: SaveOptions & { reload: false },
	): Promise<DeepPartial<DeviceSession>> {
		return this.repo.save(entities, options);
	}
}
