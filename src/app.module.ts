import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createPostgresDatabase } from 'typeorm-extension';
import { DataSourceOptions } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';

@Module({
	imports: [
		// GraphQL and Apollo SandBox
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			// Avoid deprecated
			subscriptions: {
				'graphql-ws': true,
				'subscriptions-transport-ws': true,
			},
			// Code first
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			sortSchema: true,
			// Init Apollo SandBox
			playground: false,
			plugins: [ApolloServerPluginLandingPageLocalDefault()],
			includeStacktraceInErrorResponses: false,
			inheritResolversFromInterfaces: false,
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
				JWT_ACCESS_SECRET: Joi.string().required(),
				JWT_ACCESS_EXPIRES: Joi.string().required(),
				JWT_REFRESH_SECRET: Joi.string().required(),
				JWT_REFRESH_EXPIRES: Joi.string().required(),
			}),
		}),
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
					database: configService.get('POSTGRES_DB'),
					synchronize: true,
				};
				await createPostgresDatabase({
					options: sqlOptions,
					ifNotExist: true,
				});
				return { ...sqlOptions, autoLoadEntities: true, synchronize: true };
			},
		}),
		// Implement fingerprint
		NestjsFingerprintModule.forRoot({
			params: ['headers', 'userAgent', 'ipAddress'],
		}),
		// Load sub modules
		UserModule,
		AuthModule,
		DeviceModule,
	],
})
export class AppModule {}
