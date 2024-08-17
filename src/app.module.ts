import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from './auth/auth.module';
import { LoadEnvModule } from './config.module';
import { SqlModule } from './sql.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
			autoSchemaFile: './src/schema.gql',
			sortSchema: true,
			// Init Apollo SandBox
			playground: false,
			plugins: [ApolloServerPluginLandingPageLocalDefault()],
			includeStacktraceInErrorResponses: false,
			inheritResolversFromInterfaces: false,
		}),
		// Admin panel module
		import('@adminjs/nestjs').then(({ AdminModule }) =>
			AdminModule.createAdminAsync({
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: async (cfgSvc: ConfigService) => ({
					adminJsOptions: {
						rootPath: '/admin',
						resources: [],
					},
					auth: {
						authenticate(email, password, ctx) {
							return email === cfgSvc.get('ADMIN_EMAIL') &&
								password === cfgSvc.get('ADMIN_PASSWORD')
								? Promise.resolve({
										email: cfgSvc.get('ADMIN_EMAIL'),
										password: cfgSvc.get('ADMIN_PASSWORD'),
									})
								: null;
						},
						cookieName: 'adminjs',
						cookiePassword: 'secret',
					},
					sessionOptions: {
						resave: true,
						saveUninitialized: true,
						secret: 'secret',
					},
				}),
			}),
		),
		// Sub modules
		AuthModule,
		LoadEnvModule,
		SqlModule('deploy'),
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('graphql');
	}
}
