import { existsSync } from 'fs';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from 'auth/auth.guard';
import { Response } from 'express';
import { FileService } from 'file/file.service';
import { User } from 'user/user.entity';

@Controller('')
export class AppController {
	constructor(
		private cfgSvc: ConfigService,
		private fileSvc: FileService,
	) {}

	@Get(':filename')
	async seeUploadedFile(
		@Param('filename') filename: string,
		@Res() res: Response,
		@CurrentUser() user: User,
	) {
		const file = await this.fileSvc.path(filename, {
			withRelations: true,
			relations: ['createdBy'],
		});

		if (existsSync(`${this.cfgSvc.get('SERVER_PUBLIC')}/${filename}`)) {
			if (filename.match(/.+\.server\..+/g))
				return res.sendFile(filename, {
					root: this.cfgSvc.get('SERVER_PUBLIC'),
				});

			if (user?.id === file.createdBy.id || file.forEveryone)
				return res.sendFile(filename, {
					root: this.cfgSvc.get('SERVER_PUBLIC'),
				});
		}
		return res
			.status(HttpStatus.BAD_REQUEST)
			.json({ error: 'Invalid request' });
	}
}
