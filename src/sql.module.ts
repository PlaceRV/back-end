import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { createPostgresDatabase } from 'typeorm-extension';

export const SqlModule = (type: 'deploy' | 'test' | string) =>
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: async (cfgSvc: ConfigService) => {
			const sqlOptions: DataSourceOptions = {
				type: 'postgres',
				host: cfgSvc.get('POSTGRES_HOST'),
				port: cfgSvc.get('POSTGRES_PORT'),
				username: cfgSvc.get('POSTGRES_USER'),
				password: cfgSvc.get('POSTGRES_PASS'),
				database: type === 'deploy' ? cfgSvc.get('POSTGRES_DB') : type,
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
