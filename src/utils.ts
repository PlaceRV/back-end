// Local
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
	),
	tstStr = () => (12).char();

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

// Global
declare global {
	interface Array<T> {
		random(): T;
		get(subString: string): Array<T>;
		last(): T;
	}
	interface Number {
		f(): number; // floor()
		r(): number; // round()
		a(): number; // abs()
		char(chars?: string): string;
		rd(): number; // random()
	}
	type Basic<T> = {
		[P in keyof T as T[P] extends Required<T>[P] ? P : never]: T[P];
	};
}

Array.prototype.get = function (subString: string) {
	return this.filter((i: string) => i.includes(subString));
};
Array.prototype.random = function () {
	return this[this.length.rd()];
};
Array.prototype.last = function () {
	return this[this.length - 1];
};
Number.prototype.char = function (
	chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
) {
	return Array(this)
		.join()
		.split(',')
		.map(() => chars.charAt(chars.length.rd()))
		.join('');
};
Number.prototype.rd = function () {
	return Math.floor(Math.random() * (this as number));
};
Number.prototype.f = function () {
	return Math.floor(Number(this));
};
Number.prototype.r = function () {
	return Math.round(Number(this));
};
Number.prototype.a = function () {
	return Math.abs(Number(this));
};
