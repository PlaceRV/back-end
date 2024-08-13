import {
	BadRequestException,
	Controller,
	Get,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from './user.entity';

@Controller('user')
export class UserController {
	@Get('')
	@UseGuards(AuthGuard('access'))
	getUser(@Req() req: Request) {
		if (req.user) {
			const { firstName, lastName, email } = req.user as unknown as User;
			return { firstName, lastName, email };
		}
		throw new BadRequestException('User not valid/found');
	}
}
