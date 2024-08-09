import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from './auth.middleware';
import { TestModule } from 'test/SQLModule';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { DeviceModule } from 'src/device/device.module';

describe('AuthMiddleware', () => {
	let authMdl: AuthMiddleware;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [...TestModule, UserModule, DeviceModule],
			providers: [AuthMiddleware, AuthService],
		}).compile();

		authMdl = module.get(AuthMiddleware);
	});

	it('should be defined', () => {
		expect(authMdl).toBeDefined();
	});
});
