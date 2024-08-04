import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PayLoad, UserMetadata } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';

export class UserRecieve {
	constructor(tkn: string, rfshTkn: string, rfshTknExpIn: string) {
		this.token = tkn;
		this.refreshToken = rfshTkn;
		this.refreshTokenExpiresIn = rfshTknExpIn;
	}
	token!: string;
	refreshToken!: string;
	refreshTokenExpiresIn!: string;
}

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
	) {}

	generateKey(length: number = 256) {
		return randomBytes(length).toString('hex');
	}

	// TODO thêm sign scrtkey vào rfshTkn
	async handleDeviceSession(usrId: string, mtdt: UserMetadata): Promise<UserRecieve> {
		const { deviceId, ipAddress, userAgent } = mtdt,
			scrtKey = this.generateKey(),
			rfshTknExpIn = this.cfgSvc.get('JWT_REFRESH_EXPIRES'),
			rfshTkn = this.jwtSvc.sign(
				{
					key: this.jwtSvc.sign(
						{ ip: ipAddress, ua: userAgent },
						{ expiresIn: '10 years', secret: scrtKey },
					),
				},
				{ secret: this.cfgSvc.get('JWT_REFRESH_SECRET'), expiresIn: rfshTknExpIn },
			),
			payload = new PayLoad(usrId, deviceId, rfshTknExpIn),
			tkn = this.jwtSvc.sign(payload.toPlainObj());

		await this.repo.save({
			deviceId: mtdt.deviceId,
			ipAddress: mtdt.ipAddress,
			userAgent: mtdt.userAgent,
			user: usrId,
			secretKey: scrtKey,
			refreshToken: rfshTkn,
			expiredAt: new Date(ms(rfshTknExpIn) + new Date().getTime()),
		});

		return new UserRecieve(tkn, rfshTkn, rfshTknExpIn);
	}
}
