import { Module } from '@nestjs/common';
import { LoadEnvModule } from 'module/config.module';
import { SqlModule } from 'module/sql.module';

@Module({
	imports: [LoadEnvModule, SqlModule('test')],
})
export class TestModule {}
