import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { validate, ValidatorOptions } from 'class-validator';
import { DeviceService } from 'device/device.service';
import { User } from 'user/user.entity';
import { ILogin, ISignUp } from 'user/user.model';
import { UserService } from 'user/user.service';
import { Cryption } from 'utils/auth.utils';

@Injectable()
export class AuthService extends Cryption {
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}

	async signUp(input: ISignUp, mtdt: string) {
		const user = await this.usrSvc.email(input.email);
		if (!user) {
			const newUser = new User(input);
			const inputErrors = (await validate(newUser)).map((i) => i.constraints);
			if (newUser.hashedPassword && !inputErrors.length) {
				await this.usrSvc.assign(newUser);
				return this.dvcSvc.getTokens(newUser, mtdt);
			}
			throw new BadRequestException(JSON.stringify(inputErrors));
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
