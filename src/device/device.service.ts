import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { Repository } from 'typeorm';
import { UserMetadata, UserRecieve } from 'src/auth/auth.dto';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
	) {}

	generateKey() {
		return randomBytes(256).toString('hex');
	}

	async handleDeviceSession(usrId: string, mtdt: UserMetadata): Promise<UserRecieve> {
		const { deviceId } = mtdt,
			scrtKey = this.generateKey(),
			payload = { id: usrId, deviceId },
			[tkn, rfshTkn] = [this.jwtSvc.sign(payload), this.generateKey()];

		await this.repo.save({
			id: mtdt.deviceId,
			ipAddress: mtdt.ipAddress,
			userAgent: mtdt.userAgent,
			user: usrId,
			secretKey: scrtKey,
			refreshToken: rfshTkn,
		});

		return { token: tkn, refreshToken: rfshTkn };
	}
}
