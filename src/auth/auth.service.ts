import { createHash } from 'crypto';
import * as fs from 'fs';
import { extname } from 'path';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { DeviceService } from 'device/device.service';
import { User } from 'user/user.entity';
import { ILogin, ISignUp } from 'user/user.model';
import { UserService } from 'user/user.service';
import { Cryption, validation } from 'utils/auth.utils';

@Injectable()
export class AuthService extends Cryption {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}

	async signUp(input: ISignUp, mtdt: string, avatar: Express.Multer.File) {
		const user = await this.usrSvc.email(input.email);
		if (!user) {
			const avatarFilePath = `${createHash('sha256')
				.update(avatar.buffer)
				.digest('hex')}${extname(avatar.originalname)}`;
			fs.writeFileSync(
				`${this.cfgSvc.get('SERVER_PUBLIC')}${avatarFilePath}`,
				avatar.buffer,
			);
			const newUser = new User({ ...input, avatarFilePath: avatarFilePath });
			return await validation(newUser, async () => {
				if (newUser.hashedPassword) {
					await this.usrSvc.assign(newUser);
					return this.dvcSvc.getTokens(newUser, mtdt);
				}
			});
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(input: ILogin, mtdt: string) {
		const user = await this.usrSvc.email(input.email);
		if (user) {
			const isPasswordMatched = compareSync(
				input.password,
				user.hashedPassword,
			);
			if (isPasswordMatched) return this.dvcSvc.getTokens(user, mtdt);
		}
		throw new BadRequestException('Invalid email or password');
	}
}
