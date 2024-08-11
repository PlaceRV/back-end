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
	],
})
export class LoadEnvModule {}
