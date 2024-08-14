import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { randomBytes } from 'crypto';
import Joi from 'joi';

@Module({
	imports: [
		// Load .env
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				// Postgres
				POSTGRES_HOST: Joi.string().required(),
				POSTGRES_PORT: Joi.string().required(),
				POSTGRES_USER: Joi.string().required(),
				POSTGRES_PASS: Joi.string().required(),
				POSTGRES_DB: Joi.string().required(),
				// Access token
				ACCESS_SECRET: Joi.string().required(),
				ACCESS_EXPIRES: Joi.string().default('5m'),
				// Refresh token
				REFRESH_SECRET: Joi.string().required(),
				REFRESH_EXPIRE: Joi.string().default('366d'),
				REFRESH_USE: Joi.number().default(6),
				// Server config
				SERVER_SECRET: Joi.string().default(randomBytes(8).toString('hex')),
				SERVER_IN_DEV: Joi.bool().default(true),
				SERVER_PORT: Joi.number().default(3000),
				SERVER_COOKIE_PREFIX: Joi.string().default(
					randomBytes(3).toString('hex'),
				),
				// bcrypt
				BCRYPT_SALT: Joi.number().default(6),
				// AES
				AES_ALGO: Joi.string().default('aes-256-ctr'),
				// Custom keys
				REFRESH_KEY: Joi.string().default(randomBytes(6).toString('hex')),
				ACCESS_KEY: Joi.string().default(randomBytes(6).toString('hex')),
			}),
		}),
	],
})
export class LoadEnvModule {}
