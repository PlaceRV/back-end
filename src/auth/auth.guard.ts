import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard as AuthPassport } from '@nestjs/passport';
import { Role } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => {
	return SetMetadata(ROLES_KEY, roles);
};

const ALLOWPUBLIC_KEY = 'allowpublic';
export const AllowPublic = () => {
	return SetMetadata(ALLOWPUBLIC_KEY, true);
};

const matchRoles = (roles: Role[], userRoles: Role[]) => {
	return roles.some((i) => userRoles.some((j) => i === j));
};

@Injectable()
export class AuthGuard extends AuthPassport('jwt') {
	constructor(
		private reflector: Reflector,
		private jwtSvc: JwtService,
		private usrSvc: UserService,
	) {
		super();
	}

	getRequest(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
		if (roles) {
			const header = context.switchToHttp().getNext().req.header('authorization') as string,
				token = header.split(' ')[1],
				decoded = this.jwtSvc.verify(token),
				user = (await this.usrSvc.find({ where: { id: decoded.id } }))[0];

			return matchRoles(roles, user.roles);
		}
		return this.reflector.get<boolean>(ALLOWPUBLIC_KEY, context.getHandler());
	}
}
