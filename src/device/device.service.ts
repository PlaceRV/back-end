import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PayLoad, UserMetadata } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';

export class UserRecieve {
	constructor(tkn: string, sessId: string) {
		this.token = tkn;
		this.sessId = sessId;
	}
	token!: string;
	sessId!: string;
}

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
	) {}

	// TODO change length to 256
	generateKey(length: number = 5) {
		return randomBytes(length).toString('hex');
	}

	async handleDeviceSession(usrId: string, mtdt: UserMetadata): Promise<UserRecieve> {
		const rfshTkn = this.jwtSvc.sign(
				{ mtdt: mtdt },
				{
					secret: this.cfgSvc.get('JWT_REFRESH_SECRET'),
					expiresIn: this.cfgSvc.get('JWT_REFRESH_EXPIRES'),
				},
			),
			payload = new PayLoad(usrId),
			tkn = this.jwtSvc.sign(payload.toPlainObj());

		const session = await this.repo.save({
			user: usrId,
			refreshToken: rfshTkn,
		});

		return new UserRecieve(tkn, session.id);
	}
}
