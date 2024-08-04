import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { PayLoad, UserMetadata } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

export class UserRecieve {
	constructor(tkn: string) {
		this.token = tkn;
	}
	token!: string;
}

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
	) {}

	async handleDeviceSession(usrId: string, mtdt: UserMetadata): Promise<UserRecieve> {
		const rfshTkn = this.jwtSvc.sign(
				{ mtdt: mtdt },
				{
					secret: this.cfgSvc.get('JWT_REFRESH_SECRET'),
					expiresIn: this.cfgSvc.get('JWT_REFRESH_EXPIRES'),
				},
			),
			payload = new PayLoad(usrId),
			tkn = this.jwtSvc.sign(payload.toPlainObj()),
			dvcId = createHash('sha256').update(mtdt.toString()).digest('base64');

		this.repo.save({
			deviceId: dvcId,
			user: usrId,
			refreshToken: rfshTkn,
		});

		return new UserRecieve(tkn);
	}
}
