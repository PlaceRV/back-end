declare module 'place-review-backend/app.module' {
	import { MiddlewareConsumer } from '@nestjs/common';
	export class AppModule {
		configure(consumer: MiddlewareConsumer): void;
	}
}
declare module 'place-review-backend/auth/auth.class' {
	export class PayLoad {
		constructor(id: string);
		id: string;
		toPlainObj(): {} & this;
	}
}
declare module 'place-review-backend/auth/auth.controller' {
	import { ConfigService } from '@nestjs/config';
	import { DeviceService } from 'device/device.service';
	import { Request, Response } from 'express';
	import { UserRecieve } from 'user/user.class';
	import { ILogin, ISignUp } from 'user/user.model';
	import { AuthService } from 'place-review-backend/auth/auth.service';
	export class AuthController {
		private authSvc;
		private dvcSvc;
		private cfgSvc;
		constructor(
			authSvc: AuthService,
			dvcSvc: DeviceService,
			cfgSvc: ConfigService,
		);
		private readonly ckiOpt;
		private readonly ckiPfx;
		private readonly rfsKey;
		private readonly acsKey;
		clearCookies(
			request: Request,
			response: Response,
			acs?: boolean,
			rfs?: boolean,
		): void;
		sendBack(
			request: Request,
			response: Response,
			usrRcv: UserRecieve,
		): boolean;
		login(
			request: Request,
			body: ILogin,
			response: Response,
			mtdt: string,
		): Promise<boolean>;
		signUp(
			request: Request,
			body: ISignUp,
			response: Response,
			mtdt: string,
		): Promise<boolean>;
		logout(request: Request, response: Response): Promise<void>;
		refresh(request: Request, response: Response, mtdt: string): Promise<void>;
	}
}
declare module 'place-review-backend/auth/auth.controller.spec' {
	export {};
}
declare module 'place-review-backend/auth/auth.guard' {
	import { ExecutionContext } from '@nestjs/common';
	import { Reflector } from '@nestjs/core';
	import { Role } from 'user/user.model';
	export const Roles: import('@nestjs/core').ReflectableDecorator<
			Role[],
			Role[]
		>,
		AllowPublic: import('@nestjs/core').ReflectableDecorator<boolean, boolean>,
		CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator,
		MetaData: (...dataOrPipes: unknown[]) => ParameterDecorator;
	const RoleGuard_base: import('@nestjs/passport').Type<
		import('@nestjs/passport').IAuthGuard
	>;
	export class RoleGuard extends RoleGuard_base {
		private reflector;
		constructor(reflector: Reflector);
		getRequest(ctx: ExecutionContext): any;
		canActivate(context: ExecutionContext): Promise<boolean>;
	}
	export {};
}
declare module 'place-review-backend/auth/auth.guard.spec' {
	export {};
}
declare module 'place-review-backend/auth/auth.interface' {
	export interface IPayload {
		id: string;
	}
}
declare module 'place-review-backend/auth/auth.middleware' {
	import { NestMiddleware } from '@nestjs/common';
	import { ConfigService } from '@nestjs/config';
	import { NextFunction, Request, Response } from 'express';
	import { Cryption } from 'utils/auth.utils';
	export class AuthMiddleware extends Cryption implements NestMiddleware {
		private cfgSvc;
		constructor(cfgSvc: ConfigService);
		private readonly rfsgrd;
		private readonly ckiPfx;
		private readonly rfsKey;
		private readonly acsKey;
		use(req: Request, res: Response, next: NextFunction): void;
	}
}
declare module 'place-review-backend/auth/auth.middleware.spec' {
	export {};
}
declare module 'place-review-backend/auth/auth.module' {
	import { MiddlewareConsumer } from '@nestjs/common';
	export class AuthModule {
		configure(consumer: MiddlewareConsumer): void;
	}
}
declare module 'place-review-backend/auth/auth.service' {
	import { ConfigService } from '@nestjs/config';
	import { DeviceService } from 'device/device.service';
	import { ILogin, ISignUp } from 'user/user.model';
	import { UserService } from 'user/user.service';
	import { Cryption } from 'utils/auth.utils';
	export class AuthService extends Cryption {
		private usrSvc;
		private dvcSvc;
		constructor(
			cfgSvc: ConfigService,
			usrSvc: UserService,
			dvcSvc: DeviceService,
		);
		signUp(
			input: ISignUp,
			mtdt: string,
		): Promise<import('place-review-backend/user/user.class').UserRecieve>;
		login(
			input: ILogin,
			mtdt: string,
		): Promise<import('place-review-backend/user/user.class').UserRecieve>;
	}
}
declare module 'place-review-backend/auth/strategies/access.strategy' {
	import { ConfigService } from '@nestjs/config';
	import { IPayload } from 'auth/auth.interface';
	import { Strategy } from 'passport-jwt';
	import { UserService } from 'user/user.service';
	const AccessStrategy_base: new (...args: any[]) => Strategy;
	export class AccessStrategy extends AccessStrategy_base {
		private usrSvc;
		constructor(cfgSvc: ConfigService, usrSvc: UserService);
		validate(
			payload: IPayload,
		): Promise<import('place-review-backend/user/user.entity').User>;
	}
	export {};
}
declare module 'place-review-backend/auth/strategies/refresh.strategy' {
	import { ConfigService } from '@nestjs/config';
	import { JwtService } from '@nestjs/jwt';
	import { IPayload } from 'auth/auth.interface';
	import { DeviceService } from 'device/device.service';
	import { Strategy } from 'passport-jwt';
	import { SessionService } from 'session/session.service';
	const RefreshStrategy_base: new (...args: any[]) => Strategy;
	export class RefreshStrategy extends RefreshStrategy_base {
		private sesSvc;
		private jwtSvc;
		private dvcSvc;
		constructor(
			cfgSvc: ConfigService,
			sesSvc: SessionService,
			jwtSvc: JwtService,
			dvcSvc: DeviceService,
		);
		validate(
			payload: IPayload,
		): Promise<
			| {
					success: boolean;
					id: string;
					ua: string;
					acsTkn: string;
					rfsTkn: string;
					userId?: undefined;
			  }
			| {
					success: boolean;
					userId: string;
					id?: undefined;
					ua?: undefined;
					acsTkn?: undefined;
					rfsTkn?: undefined;
			  }
		>;
	}
	export {};
}
declare module 'place-review-backend/build' {
	export {};
}
declare module 'place-review-backend/device/device.entity' {
	import { Session } from 'session/session.entity';
	import { User } from 'user/user.entity';
	import { SensitiveInfomations } from 'utils/typeorm.utils';
	import { IDevice } from 'place-review-backend/device/device.interface';
	export class Device extends SensitiveInfomations implements IDevice {
		constructor(payload: IDevice);
		owner: User;
		sessions: Session[];
		hashedUserAgent: string;
		valid: boolean;
	}
}
declare module 'place-review-backend/device/device.interface' {
	import { IUser } from 'user/user.model';
	export interface IDevice {
		owner: IUser;
		hashedUserAgent: string;
		valid: boolean;
	}
}
declare module 'place-review-backend/device/device.module' {
	export class DeviceModule {}
}
declare module 'place-review-backend/device/device.resolver' {
	import { DeviceService } from 'place-review-backend/device/device.service';
	export class DeviceResolver {
		private readonly deviceService;
		constructor(deviceService: DeviceService);
	}
}
declare module 'place-review-backend/device/device.service' {
	import { ConfigService } from '@nestjs/config';
	import { JwtService } from '@nestjs/jwt';
	import { SessionService } from 'session/session.service';
	import { Repository } from 'typeorm';
	import { UserRecieve } from 'user/user.class';
	import { User } from 'user/user.entity';
	import { DatabaseRequests } from 'utils/typeorm.utils';
	import { Device } from 'place-review-backend/device/device.entity';
	export class DeviceService extends DatabaseRequests<Device> {
		private jwtSvc;
		private cfgSvc;
		private sesSvc;
		constructor(
			repo: Repository<Device>,
			jwtSvc: JwtService,
			cfgSvc: ConfigService,
			sesSvc: SessionService,
		);
		private readonly scr;
		private readonly exp;
		refreshTokenSign(id: string): string;
		getTokens(user: User, mtdt: string): Promise<UserRecieve>;
		remove(session_id: string): Promise<import('typeorm').DeleteResult>;
	}
}
declare module 'place-review-backend/main' {
	export {};
}
declare module 'place-review-backend/models' {
	export const IPayloadKeys: readonly ['id'];
	export const IDeviceKeys: readonly ['hashedUserAgent', 'owner', 'valid'];
	export const IPlaceInfoKeys: readonly [
		'description',
		'latitude',
		'longitude',
		'name',
		'type',
	];
	export const IPlaceKeys: readonly ['createdBy'];
	export const ISessionKeys: readonly ['device', 'useTimeLeft'];
	export const IUserAuthenticationKeys: readonly ['email', 'password'];
	export const IUserInfoKeys: readonly [
		'description',
		'email',
		'firstName',
		'lastName',
		'roles',
	];
	export const IUserKeys: readonly ['devices', 'placesAssigned'];
	export const IUserRecieveKeys: readonly ['accessToken', 'refreshToken'];
	export const ILoginKeys: readonly [];
	export const ISignUpKeys: readonly [];
	export const ExpectationKeys: readonly ['debug', 'not', 'params', 'type'];
}
declare module 'place-review-backend/module/config.module' {
	export const loadEnv: (
		type: 'deploy' | 'test',
	) => import('@nestjs/common').DynamicModule;
}
declare module 'place-review-backend/module/sql.module' {
	export const SqlModule: (
		type: 'deploy' | 'test',
	) => import('@nestjs/common').DynamicModule;
}
declare module 'place-review-backend/module/test.module' {
	import { MiddlewareConsumer } from '@nestjs/common';
	export class TestModule {
		configure(consumer: MiddlewareConsumer): void;
	}
}
declare module 'place-review-backend/place/place.entity' {
	import { User } from 'user/user.entity';
	import { SensitiveInfomations } from 'utils/typeorm.utils';
	import { InterfaceCasting } from 'utils/utils';
	import { IPlace, PlaceType } from 'place-review-backend/place/place.model';
	export class Place extends SensitiveInfomations implements IPlace {
		constructor(payload: IPlace);
		createdBy?: User;
		name: string;
		type: PlaceType;
		private location;
		private _longitude;
		set longitude(i: number);
		get longitude(): number;
		private _latitude;
		set latitude(i: number);
		get latitude(): number;
		description: string;
		static get test(): Place;
		get info(): InterfaceCasting<
			this,
			'description' | 'latitude' | 'longitude' | 'name' | 'type'
		>;
	}
	const PlaceAssign_base: import('@nestjs/common').Type<
		Pick<Place, 'description' | 'latitude' | 'longitude' | 'name' | 'type'>
	>;
	export class PlaceAssign extends PlaceAssign_base {}
	export {};
}
declare module 'place-review-backend/place/place.model' {
	import { IUser } from 'user/user.model';
	export interface IPlaceInfo {
		name: string;
		type: PlaceType;
		longitude: number;
		latitude: number;
		description: string;
	}
	export interface IPlace extends IPlaceInfo {
		createdBy?: IUser;
	}
	export enum PlaceType {
		CHURCH = 'CHURCH',
		TEMPLE = 'TEMPLE',
		NONE = 'NONE',
	}
}
declare module 'place-review-backend/place/place.module' {
	export class PlaceModule {
		constructor();
	}
}
declare module 'place-review-backend/place/place.resolver' {
	import { User } from 'user/user.entity';
	import { Place, PlaceAssign } from 'place-review-backend/place/place.entity';
	import { PlaceService } from 'place-review-backend/place/place.service';
	export class PlaceResolver {
		private plcSvc;
		constructor(plcSvc: PlaceService);
		placeAll(): Promise<Place[]>;
		placeCreate(
			user: User,
			input: PlaceAssign,
		): Promise<
			import('place-review-backend/utils/utils').InterfaceCasting<
				Place,
				'description' | 'latitude' | 'longitude' | 'name' | 'type'
			>
		>;
	}
}
declare module 'place-review-backend/place/place.resolver.spec' {
	export {};
}
declare module 'place-review-backend/place/place.service' {
	import { Repository } from 'typeorm';
	import { User } from 'user/user.entity';
	import { UserService } from 'user/user.service';
	import { DatabaseRequests } from 'utils/typeorm.utils';
	import { Place, PlaceAssign } from 'place-review-backend/place/place.entity';
	export class PlaceService extends DatabaseRequests<Place> {
		private usrSvc;
		constructor(repo: Repository<Place>, usrSvc: UserService);
		assign(placeAssign: PlaceAssign, usr: User): Promise<Place>;
	}
}
declare module 'place-review-backend/session/session.entity' {
	import { Device } from 'device/device.entity';
	import { SensitiveInfomations } from 'utils/typeorm.utils';
	import { ISession } from 'place-review-backend/session/session.interface';
	export class Session extends SensitiveInfomations implements ISession {
		constructor(input: ISession);
		device: Device;
		useTimeLeft: number;
	}
}
declare module 'place-review-backend/session/session.interface' {
	import { IDevice } from 'device/device.interface';
	export interface ISession {
		device: IDevice;
		useTimeLeft: number;
	}
}
declare module 'place-review-backend/session/session.module' {
	export class SessionModule {}
}
declare module 'place-review-backend/session/session.service' {
	import { ConfigService } from '@nestjs/config';
	import { Device } from 'device/device.entity';
	import { Repository } from 'typeorm';
	import { DatabaseRequests } from 'utils/typeorm.utils';
	import { Session } from 'place-review-backend/session/session.entity';
	export class SessionService extends DatabaseRequests<Session> {
		private cfgSvc;
		constructor(repo: Repository<Session>, cfgSvc: ConfigService);
		private readonly use;
		assign(device: Device): Promise<Session>;
		update(id: string): Promise<Session>;
		remove(id: string): Promise<import('typeorm').DeleteResult>;
	}
}
declare module 'place-review-backend/user/user.class' {
	import { IUserRecieve } from 'place-review-backend/user/user.model';
	export class UserRecieve implements IUserRecieve {
		constructor(payload: IUserRecieve);
		accessToken: string;
		refreshToken: string;
		static get test(): UserRecieve;
	}
}
declare module 'place-review-backend/user/user.controller' {
	import { Request } from 'express';
	import { User } from 'place-review-backend/user/user.entity';
	export class UserController {
		getUser(
			req: Request,
		): import('place-review-backend/utils/utils').InterfaceCasting<
			User,
			'description' | 'email' | 'firstName' | 'lastName' | 'roles'
		>;
	}
}
declare module 'place-review-backend/user/user.controller.spec' {
	export {};
}
declare module 'place-review-backend/user/user.entity' {
	import { Device } from 'device/device.entity';
	import { Place } from 'place/place.entity';
	import { SensitiveInfomations } from 'utils/typeorm.utils';
	import { InterfaceCasting } from 'utils/utils';
	import { IUser, Role } from 'place-review-backend/user/user.model';
	export class User extends SensitiveInfomations implements IUser {
		constructor(payload: IUser);
		private _hashedPassword;
		get hashedPassword(): any;
		set hashedPassword(i: any);
		devices?: Device[];
		placesAssigned?: Place[];
		firstName: string;
		lastName: string;
		email: string;
		description: string;
		roles: Role[];
		password: string;
		get info(): InterfaceCasting<
			this,
			'description' | 'email' | 'firstName' | 'lastName' | 'roles'
		>;
		static test(from: string): User;
	}
}
declare module 'place-review-backend/user/user.model' {
	import { IDevice } from 'device/device.interface';
	import { IPlace } from 'place/place.model';
	export interface IUserAuthentication {
		email: string;
		password: string;
	}
	export interface IUserInfo {
		firstName: string;
		lastName: string;
		description: string;
		roles?: Role[];
		email: string;
	}
	export interface IUser extends IUserAuthentication, IUserInfo {
		devices?: IDevice[];
		placesAssigned?: IPlace[];
	}
	export interface IUserRecieve {
		accessToken: string;
		refreshToken: string;
	}
	export interface ILogin extends IUserAuthentication {}
	export interface ISignUp extends IUserAuthentication, IUserInfo {}
	export enum Role {
		USER = 'USER',
		ADMIN = 'ADMIN',
		STAFF = 'STAFF',
	}
}
declare module 'place-review-backend/user/user.module' {
	import { MiddlewareConsumer } from '@nestjs/common';
	export class UserModule {
		constructor();
		configure(consumer: MiddlewareConsumer): void;
	}
}
declare module 'place-review-backend/user/user.resolver' {
	import { User } from 'place-review-backend/user/user.entity';
	import { UserService } from 'place-review-backend/user/user.service';
	export class UserResolver {
		private usrSvc;
		constructor(usrSvc: UserService);
		user(
			id: string,
		): Promise<
			import('place-review-backend/utils/utils').InterfaceCasting<
				User,
				'description' | 'email' | 'firstName' | 'lastName' | 'roles'
			>
		>;
		userAll(): Promise<
			import('place-review-backend/utils/utils').InterfaceCasting<
				User,
				'description' | 'email' | 'firstName' | 'lastName' | 'roles'
			>[]
		>;
	}
}
declare module 'place-review-backend/user/user.resolver.spec' {
	export {};
}
declare module 'place-review-backend/user/user.service' {
	import { Repository } from 'typeorm';
	import { DatabaseRequests } from 'utils/typeorm.utils';
	import { User } from 'place-review-backend/user/user.entity';
	export class UserService extends DatabaseRequests<User> {
		constructor(repo: Repository<User>);
		email(input: string): Promise<User>;
		assign(newUser: User): Promise<User>;
	}
}
declare module 'place-review-backend/utils/auth.utils' {
	export class Cryption {
		private algorithm;
		private svrScr;
		constructor(algorithm: string, svrScr: string);
		sigToKey(str: string): string;
		encrypt(text: string, key?: string): string;
		decrypt(encryptedText: string, key?: string): string;
	}
}
declare module 'place-review-backend/utils/test.utils' {
	export const spy: <T extends Record<string, any>>(
		arr: { obj: T; key: (keyof T)[] }[],
	) => void;
	interface Expectation<T, K extends keyof jest.Matchers<T>> {
		type: K;
		params: Parameters<jest.Matchers<T>[K]>;
		not?: boolean;
		debug?: boolean;
	}
	export function execute<
		T extends (...args: any[]) => Promise<any>,
		K extends keyof jest.Matchers<T>,
	>(
		func: T,
		{
			params,
			throwError,
			numOfRun,
		}: { params?: Parameters<T>; throwError?: boolean; numOfRun?: number },
		exps: Expectation<T, K>[],
	): Promise<void>;
	export {};
}
declare module 'place-review-backend/utils/typeorm.utils' {
	import {
		BaseEntity,
		DeepPartial,
		FindOptionsWhere,
		Repository,
		SaveOptions,
	} from 'typeorm';
	export class SensitiveInfomations extends BaseEntity {
		constructor();
		id: string;
	}
	export class DatabaseRequests<T extends SensitiveInfomations> {
		protected repo: Repository<T>;
		constructor(repo: Repository<T>);
		protected find(options?: FindOptionsWhere<T>): Promise<T[]>;
		protected findOne(options?: FindOptionsWhere<T>): Promise<T>;
		protected save(entities: DeepPartial<T>, options?: SaveOptions): Promise<T>;
		protected delete(
			criteria: FindOptionsWhere<T>,
		): Promise<import('typeorm').DeleteResult>;
		id(id: string): Promise<T>;
		all(): Promise<T[]>;
	}
}
declare module 'place-review-backend/utils/utils' {
	export const methodDecorator: (
			before?: (t: any, args: any) => void,
			after?: (t: any, result: any) => void,
		) => (
			_target: any,
			propertyKey: any,
			descriptor: PropertyDescriptor,
		) => PropertyDescriptor,
		logMethodCall: (
			_target: any,
			propertyKey: any,
			descriptor: PropertyDescriptor,
		) => PropertyDescriptor,
		tstStr: () => string,
		hash: (i: string) => string;
	export function allImplement(
		decorator: (
			target: any,
			propertyKey: any,
			descriptor: any,
		) => PropertyDescriptor,
	): (target: { prototype: any }) => void;
	export class InterfaceCasting<T, K extends keyof T> {
		[key: string]: any;
		constructor(input: T, get: readonly K[]);
		static quick<T, K extends keyof T>(
			input: T,
			get: readonly K[],
		): InterfaceCasting<T, K>;
	}
	global {
		interface Array<T> {
			random(): T;
			get(subString: string): Array<T>;
			last(): T;
		}
		interface Number {
			f(): number;
			r(): number;
			a(): number;
			char(chars?: string): string;
			rd(): number;
			ra(input: () => Promise<any>): Promise<void>;
		}
		function matching<T>(input: T[], required: T[]): boolean;
		function curFile(file: string, cut?: number): string;
	}
}
declare module 'place-review-backend/utils/utils.spec' {
	import './utils';
}
declare module 'place-review-backend' {
	import main = require('place-review-backend/index');
	export = main;
}
