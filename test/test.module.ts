import { LoadEnvModule } from '@backend/config.module';
import { SqlModule } from '@backend/sql.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [LoadEnvModule, SqlModule('test')],
})
export class TestModule {}
