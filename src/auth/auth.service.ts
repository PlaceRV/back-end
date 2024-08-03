import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { DeviceService } from 'src/device/device.service';
import { DeepPartial } from 'typeorm';
import { IncomingMessage } from 'http';

export class GqlContext {
	req: IncomingMessage;
}

export class PayLoad {
	constructor(id: string, deviceId: string, rfshTknExpAt: string) {
		this.id = id;
		this.deviceId = deviceId;
		this.rfshTknExpAt = rfshTknExpAt;
	}

	id!: string;
	deviceId!: string;
	rfshTknExpAt!: string;

	toPlainObj(): DeepPartial<PayLoad> {
		return Object.assign({}, this);
	}
}

export class UserMetadata {
	constructor(req: IncomingMessage) {
		const fp = req['fp'];
		this.deviceId = fp.id;
		this.userAgent = this.objectToString(fp.userAgent);
		this.ipAddress = fp.ipAddress.value;
	}

	ipAddress!: string;
	userAgent!: string;
	deviceId!: string;

	objectToString(obj: object) {
		if (typeof obj === 'object') {
			return `{${Object.keys(obj)
				.map((key) => `"${key}":${this.objectToString(obj[key])}`)
				.join(',')}}`;
		} else return JSON.stringify(obj);
	}
}

@Injectable()
export class AuthService {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		private dvcSvc: DeviceService,
	) {}

	async signUp(signUpDto: SignUpDto, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ where: { email: signUpDto.email } });
		if (!user) {
			signUpDto.password = await bcrypt.hash(signUpDto.password, await bcrypt.genSalt(Number(this.cfgSvc.get('BCRYPT_SALT'))));

			const user = await this.usrSvc.save(signUpDto);
			return this.dvcSvc.handleDeviceSession(user.id, mtdt);
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(loginDto: LoginDto, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ where: { email: loginDto.email } });
		if (user) {
			const isPasswordMatched = await bcrypt.compare(loginDto.password, user.password);
			if (isPasswordMatched) return this.dvcSvc.handleDeviceSession(user.id, mtdt);
		}
		throw new BadRequestException('Invalid email or password');
	}
}
