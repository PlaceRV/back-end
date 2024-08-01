import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    // Load GraphQL and Apollo SandBox
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
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
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASS: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    // Load TypeOrm
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
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
