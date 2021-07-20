import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.common',
        `config/.env.${process.env['GLOBAl_ENV'] || 'prod'}`,
      ],
    }),
  ],
})
export default class EnvConfigModule {}
