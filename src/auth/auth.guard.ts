import { ExecutionContext, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

const matchRoles = (roles: Role[], userRoles: Role[]) => {
	return roles.some((i) => userRoles.some((j) => i === j));
};

export const Roles = Reflector.createDecorator<Role[]>(),
	AllowPublic = Reflector.createDecorator<boolean>();

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
		if (this.reflector.get(AllowPublic, context.getHandler())) return true;
		await super.canActivate(context); // Check user's authencation via access-strategy
		const roles = this.reflector.get(Roles, context.getHandler());
		if (roles) {
			const req = context.switchToHttp().getNext().req,
				user = req.user;

			return matchRoles(roles, user.roles);
		}
		throw new InternalServerErrorException('Function not defined roles/permissions');
	}
}
