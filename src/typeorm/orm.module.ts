import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ConfigService from '../common/configs/config.service';
import { EConfigEnv } from '../types/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        charset: 'utf8_general_ci',
        host: config.get<string>(ConfigService.DATABASE_HOST),
        port: Number(config.get<number>(ConfigService.DATABASE_PORT)),
        username: config.get<string>(ConfigService.DATABASE_USERNAME),
        password: config.get<string>(ConfigService.DATABASE_PWD),
        database: config.get<string>(ConfigService.DATABASE_NAME),
        synchronize: config.get(ConfigService.ENV_NAME) === EConfigEnv.DEV, // 每次运行应用的时候实体都将与数据库同步
        entities: ['dist/typeorm/entity/**/*.js'],
        migrations: ['dist/typeorm/migration/**/*.js'],
        subscribers: ['dist/typeorm/subscriber/**/*.js'],
        insecureAuth: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export default class OrmModule {
  // static forRoot(config: ConfigService): DynamicModule {
  //   return {
  //     global: true,
  //     module: OrmModule,
  //     imports: [
  //       TypeOrmModule.forRoot({
  //         type: 'mysql',
  //         charset: 'utf8_general_ci',
  //         host: config.get<string>(ConfigService.DATABASE_HOST),
  //         port: Number(config.get<number>(ConfigService.DATABASE_PORT)),
  //         username: config.get<string>(ConfigService.DATABASE_USERNAME),
  //         password: config.get<string>(ConfigService.DATABASE_PWD),
  //         database: config.get<string>(ConfigService.DATABASE_NAME),
  //         synchronize: config.get(ConfigService.ENV_NAME) === EConfigEnv.DEV, // 每次运行应用的时候实体都将与数据库同步
  //         entities: ['dist/typeorm/entity/**/*.js'],
  //         migrations: ['dist/typeorm/migration/**/*.js'],
  //         subscribers: ['dist/typeorm/subscriber/**/*.js'],
  //         insecureAuth: true,
  //       }),
  //     ],
  //   };
  // }
}
