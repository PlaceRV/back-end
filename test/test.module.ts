import { Module } from '@nestjs/common';
import { LoadEnvModule } from 'config.module';
import { SqlModule } from 'sql.module';

@Module({
	imports: [LoadEnvModule, SqlModule('test')],
})
export class TestModule {}
