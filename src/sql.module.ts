import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { createPostgresDatabase } from 'typeorm-extension';

export const SqlModule = (type: 'deploy' | 'test') =>
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
				database: type === 'deploy' ? configService.get('POSTGRES_DB') : type,
				synchronize: true,
			};
			await createPostgresDatabase({
				options: sqlOptions,
				ifNotExist: true,
			});
			if (type === 'deploy')
				return { ...sqlOptions, autoLoadEntities: true, synchronize: true };
			else
				return {
					...sqlOptions,
					entities: ['./src/**/*.entity.*'],
					synchronize: true,
				};
		},
	});
