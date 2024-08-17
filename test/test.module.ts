import { Module } from '@nestjs/common';
import { LoadEnvModule } from 'src/config.module';
import { SqlModule } from 'src/sql.module';

@Module({
	imports: [LoadEnvModule, SqlModule('test')],
})
export class TestModule {}
