import { randomBytes } from 'crypto';

export type InitClass<T> = {
	[K in keyof T as T[K] extends string | boolean | number | any[]
		? K
		: never]: T[K];
};

export class Str {
	static random(length: number = 12) {
		return randomBytes(length / 2).toString('hex');
	}
}

export class Base<T> {
	constructor(payload: InitClass<T>) {
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
