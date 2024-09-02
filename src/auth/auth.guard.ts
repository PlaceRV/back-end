import { Role } from '@backend/user/user.enum';
import {
	createParamDecorator,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/**
 * * Convert context's request to graphql's request
 * @param {ExecutionContext} context - context's request
 * ! Cautious: Since using GraphQL, it's NOT recommend to DELETE this
 */
function convertForGql(context: ExecutionContext) {
	const ctx = GqlExecutionContext.create(context);
	return ctx.getContext().req;
}

// Decorators
export const Roles = Reflector.createDecorator<Role[]>(),
	AllowPublic = Reflector.createDecorator<boolean>(),
	CurrentUser = createParamDecorator((context: ExecutionContext) => {
		return convertForGql(context).user;
	});

@Injectable()
export class RoleGuard extends AuthGuard('access') {
	constructor(private reflector: Reflector) {
		super();
	}

	getRequest(ctx: ExecutionContext) {
		return convertForGql(ctx);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.get(AllowPublic, context.getHandler())) return true;
		await super.canActivate(context); // ! Must run to check passport
		const roles = this.reflector.get(Roles, context.getHandler());
		if (roles) {
			const req = this.getRequest(context),
				user = req.user;

			return matching(user.roles, roles);
		}
		throw new InternalServerErrorException(
			'Function not defined roles/permissions',
		);
	}
}
