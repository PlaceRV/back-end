import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { Repository } from 'typeorm';
import { UserRecieve } from 'src/auth/auth.dto';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PayLoad, UserMetadata } from 'src/auth/auth.service';

@Injectable()
export class DeviceService {
	constructor(
		@InjectRepository(DeviceSession) private repo: Repository<DeviceSession>,
		private jwtSvc: JwtService,
	) {}

	generateKey(length: number = 256) {
		return randomBytes(length).toString('hex');
	}

	// TODO thêm sign scrtkey vào rfshTrf
	async handleDeviceSession(usrId: string, mtdt: UserMetadata): Promise<UserRecieve> {
		const { deviceId } = mtdt,
			scrtKey = this.generateKey(),
			payload = new PayLoad(usrId, deviceId),
			[tkn, rfshTkn] = [this.jwtSvc.sign(payload.toPlainObj()), this.generateKey()];

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
