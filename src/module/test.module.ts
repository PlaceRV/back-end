import { ApolloDriver } from '@nestjs/apollo';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthMiddleware } from 'auth/auth.middleware';
import { LoadEnvModule } from 'module/config.module';
import { SqlModule } from 'module/sql.module';

@Module({
	imports: [
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			autoSchemaFile: 'schema.gql',
			sortSchema: true,
			playground: false,
		}),
		LoadEnvModule,
		SqlModule('test'),
	],
})
export class TestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('graphql');
	}
}
