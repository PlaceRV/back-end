import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'device/device.entity';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'utils/typeorm.utils';
import { Session } from './session.entity';

@Injectable()
export class SessionService extends DatabaseRequests<Session> {
	constructor(
		@InjectRepository(Session) repo: Repository<Session>,
		private cfgSvc: ConfigService,
	) {
		super(repo);
	}
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	async assign(device: Device) {
		return new Session(await this.save({ device, useTimeLeft: this.use }));
	}

	async update(id: string) {
		const useTimeLeft = (await this.id(id)).useTimeLeft - 1;
		return new Session(await this.save({ id, useTimeLeft }));
	}

	remove(id: string) {
		return this.delete({ id });
	}
}
