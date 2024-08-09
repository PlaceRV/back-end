import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import Joi from 'joi';
import { DeviceSession } from 'src/device/device.entity';
import { User } from 'src/user/user.entity';
import { DataSourceOptions } from 'typeorm';
import { createPostgresDatabase } from 'typeorm-extension';

export const TestModule = [
	// Load entities
	TypeOrmModule.forFeature([User, DeviceSession]),
	// TypeOrm
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: async (configService: ConfigService) => {
			const sqlOptions: DataSourceOptions = {
				type: 'postgres',
				host: configService.get('POSTGRES_HOST'),
				port: configService.get('POSTGRES_PORT'),
				username: configService.get('POSTGRES_USER'),
				password: configService.get('POSTGRES_PASS'),
				database: 'test',
				synchronize: true,
			};
			await createPostgresDatabase({
				options: sqlOptions,
				ifNotExist: true,
			});
			return { ...sqlOptions, autoLoadEntities: true, synchronize: true };
		},
	}),
	// Load .env
	ConfigModule.forRoot({
		isGlobal: true,
		validationSchema: Joi.object({
			// Postgres secret
			POSTGRES_HOST: Joi.string().required(),
			POSTGRES_PORT: Joi.string().required(),
			POSTGRES_USER: Joi.string().required(),
			POSTGRES_PASS: Joi.string().required(),
			POSTGRES_DB: Joi.string().required(),
			// Jwt secret
			JWT_SECRET: Joi.string().required(),
			JWT_EXPIRES: Joi.string().default('5m'),
			// Server secret
			SERVER_SECRET: Joi.string().required(),
			REFRESH_EXPIRE: Joi.string().default('366d'),
			REFRESH_USE: Joi.number().default(6),
			PORT: Joi.number().default(3000),
			// bcrypt secret
			BCRYPT_SALT: Joi.number().default(6),
			// AES secret
			AES_ALGO: Joi.string().default('aes-256-ctr'),
			// Maxmind secret
			MAXMIND_LICENSE_KEY: Joi.string().required(),
			MAXMIND_ACCOUNT_ID: Joi.string().required(),
			// Custom keys
			REFRESH: Joi.string() || randomBytes(6).toString('hex'),
			ACCESS: Joi.string() || randomBytes(6).toString('hex'),
		}),
	}),
	// Authencation
	PassportModule.register({ session: true }),
	JwtModule.registerAsync({
		global: true,
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (cfg: ConfigService) => {
			return {
				secret: cfg.get('JWT_SECRET'),
				signOptions: {
					expiresIn: cfg.get('JWT_EXPIRES'),
				},
			};
		},
	}),
];
