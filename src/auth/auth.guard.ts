import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { PayLoad } from './auth.service';

const ALLOWPUBLIC_KEY = 'allowpublic',
	matchRoles = (roles: Role[], userRoles: Role[]) => {
		return roles.some((i) => userRoles.some((j) => i === j));
	};

export const Roles = Reflector.createDecorator<Role[]>(),
	AllowPublic = () => SetMetadata(ALLOWPUBLIC_KEY, true);

@Injectable()
export class RoleGuard extends AuthGuard('access') {
	constructor(
		private reflector: Reflector,
		private jwtSvc: JwtService,
		private usrSvc: UserService,
	) {
		super();
	}

	/**
	 * Convert context's request to graphql's request
	 * @param {ExecutionContext} context - context's request
	 * @return {GqlExecutionContext} graphql's request
	 */
	getRequest(context: ExecutionContext): GqlExecutionContext {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}

	/**
	 * Check user's role
	 * @param {ExecutionContext} context - context from request
	 * @return {boolean} allow user proceed process
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (await super.canActivate(context)) {
			const roles = this.reflector.get(Roles, context.getHandler());
			if (roles) {
				const req = context.switchToHttp().getNext().req,
					token = req.header('authorization').split(' ')[1],
					decoded = this.jwtSvc.verify(token) as PayLoad,
					user = await this.usrSvc.findOne({ where: { id: decoded.id } }),
					dvcId = req.fp.id;

				//if (dvcId !== decoded.deviceId) throw new UnauthorizedException('Device not match');

				return matchRoles(roles, user.roles);
			}
		}
		return this.reflector.get<boolean>(ALLOWPUBLIC_KEY, context.getHandler());
	}
}
