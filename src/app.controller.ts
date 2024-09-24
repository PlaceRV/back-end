import { existsSync } from 'fs';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('')
export class AppController {
	constructor(private cfgSvc: ConfigService) {}

	@Get(':filename')
	seeUploadedFile(@Param('filename') filename: string, @Res() res: Response) {
		if (!existsSync(this.cfgSvc.get('SERVER_PUBLIC') + filename))
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ error: 'Invalid request' });
		return res.sendFile(filename, { root: this.cfgSvc.get('SERVER_PUBLIC') });
	}
}
