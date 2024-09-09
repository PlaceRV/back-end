import { hashSync } from 'bcrypt';

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
	tstStr = () => (12).char(),
	hash = (i: string) => hashSync(i, (8).rd() + 4);

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

export class InterfaceCasting<T, K extends keyof T> {
	[key: string]: any;

	constructor(input: T, get: readonly K[]) {
		get.forEach((_) => (this[String(_)] = input[_]));
	}

	static quick<T, K extends keyof T>(input: T, get: readonly K[]) {
		return new InterfaceCasting(input, get);
	}
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
		ra(input: () => Promise<any>): Promise<void>; // range() # like Python's range()
	}

	/**
	 * Comparing require objects and input objects
	 * @param {T[]} input - Input objects
	 * @param {T[]} required - Require objects
	 * @return {Boolean} Is input objects sastisfy with require objects
	 */
	function matching<T>(input: T[], required: T[]): boolean;
	/**
	 * Return the formatted name of current file
	 * @param {string} file - the current file's name (must be __filename)
	 * @param {number} cut - How many chunk should get (default: 2)
	 * @return {string} formatted file's name
	 */
	function curFile(file: string, cut?: number): string;
}

global.curFile = (file: string, cut = 2) =>
	file
		.split('\\')
		.last()
		.split('.')
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.slice(0, cut)
		.join('');
global.matching = <T>(input: T[], required: T[]): boolean => {
	return required.every((i) => input.some((j) => i === j));
};
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
	chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
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
Number.prototype.ra = async function (input: () => Promise<any>) {
	await Array.from({ length: Number(this) }, (_, i) => i).reduce(async (i) => {
		await i;
		return input();
	}, Promise.resolve());
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
