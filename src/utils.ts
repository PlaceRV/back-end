import { randomBytes } from 'crypto';

/**
 * https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript
 */
type IfEquals<X, Y, A, B> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeysOf<T> = {
	[P in keyof T]: IfEquals<
		{ [Q in P]: T[P] },
		{ -readonly [Q in P]: T[P] },
		P,
		never
	>;
}[keyof T];

type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

export type ClassProperties<T> = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	[K in keyof WritablePart<T> as T[K] extends Function ? never : K]: T[K];
};

export class Str {
	static random(length: number = 12) {
		return randomBytes(length / 2).toString('hex');
	}
}

// @deprecated Implement this constructor to class instead
export class Base<T> {
	constructor(payload: ClassProperties<T>) {
		for (const key in payload as any) this[key] = payload[key];
	}
}

export const methodDecorator =
		(
			before?: (t: any, args: any) => void,
			after?: (t: any, result: any) => void,
		) =>
		(_target: any, propertyKey: any, descriptor: PropertyDescriptor) => {
			const originalMethod = descriptor.value;
			descriptor.value = function (...args: any) {
				before ? before(this, args) : null;
				const result = originalMethod.apply(this, args);
				after ? after(this, result) : null;
				return result;
			};
			return descriptor;
		},
	logMethodCall = methodDecorator(
		(propertyKey, args) => {
			console.log(`Calling ${propertyKey} with arguments:`, args);
		},
		(propertyKey, result) => {
			console.log(`Result of ${propertyKey}:`, result);
		},
	);

export function allImplement(
	decorator: (
		target: any,
		propertyKey: any,
		descriptor: any,
	) => PropertyDescriptor,
) {
	return function (target: { prototype: any }) {
		for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
			if (typeof target.prototype[propertyName] === 'function') {
				const descriptor = Object.getOwnPropertyDescriptor(
					target.prototype,
					propertyName,
				);
				Object.defineProperty(
					target.prototype,
					propertyName,
					decorator(target, propertyName, descriptor),
				);
			}
		}
	};
}
