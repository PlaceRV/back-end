import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { DeviceService } from 'src/device/device.service';
import { DeepPartial } from 'typeorm';
import { IncomingMessage } from 'http';
import { compareSync, hashSync } from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class PayLoad {
	constructor(id: string) {
		this.id = id;
	}

	id!: string;

	toPlainObj(): DeepPartial<PayLoad> {
		return Object.assign({}, this);
	}
}

export class UserMetadata {
	constructor(req: IncomingMessage) {
		const fp = req['fingerprint'];
		this.userAgent = fp.ua;
		this.ipAddress = fp.ip;
	}

	ipAddress!: string;
	userAgent!: object;

	toString(obj: object = this.userAgent) {
		if (typeof obj === 'object') {
			return `{${Object.keys(obj)
				.map((key) => `${key}:${obj[key] ? this.toString(obj[key]) : '~'}`)
				.join(',')}}`;
		} else return JSON.stringify(obj);
	}
}

@Injectable()
export class AuthService {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
	) {}
	private readonly slt = this.cfgSvc.get('BCRYPT_SALT');
	private readonly algorithm = this.cfgSvc.get('AES_ALGO');
	private readonly svrScr = this.cfgSvc.get('SERVER_SECRET');

	async signUp(signUpDto: SignUpDto, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ where: { email: signUpDto.email } });
		if (!user) {
			signUpDto.password = this.hash(signUpDto.password);

			const user = await this.usrSvc.save(signUpDto);
			return this.dvcSvc.getTokens(user.id, mtdt);
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(loginDto: LoginDto, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ where: { email: loginDto.email } });
		if (user) {
			const isPasswordMatched = compareSync(loginDto.password, user.password);
			if (isPasswordMatched) return this.dvcSvc.getTokens(user.id, mtdt);
		}
		throw new BadRequestException('Invalid email or password');
	}

	sigToKey(str: string): string {
		const first32Chars = str.substring(0, 32);
		return first32Chars.padStart(32, '0');
	}

	encrypt(text: string, key = this.svrScr) {
		const iv = randomBytes(16),
			cipher = createCipheriv(this.algorithm, this.sigToKey(key), iv),
			encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
		return iv.toString('hex') + encrypted.toString('hex');
	}

	decrypt(encryptedText: string, key = this.svrScr) {
		if (!encryptedText) return '';
		const iv = Buffer.from(encryptedText.substring(0, 32), 'hex'),
			encrypted = Buffer.from(encryptedText.substring(32), 'hex'),
			decipher = createDecipheriv(this.algorithm, this.sigToKey(key), iv),
			decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		return decrypted.toString();
	}

	hash(text: string) {
		return hashSync(text, this.slt);
	}
}
