if (!navigator.userAgent.includes('Node.js')) (window as any).global = window;

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
	tstStr = () => (12).alpha,
	matching = <T>(input: T[], required: T[]): boolean =>
		required.every((i) => input.some((j) => i === j)),
	allImplement = (
		decorator: (
			target: any,
			propertyKey: any,
			descriptor: any,
		) => PropertyDescriptor,
	) => {
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
	};

export class InterfaceCasting<T, K extends keyof T> {
	[key: string]: any;

	constructor(input: T, get: readonly K[]) {
		get.forEach((_) => (this[String(_)] = input[_]));
	}

	static quick<T, K extends keyof T>(input: T, get: readonly K[]) {
		return new InterfaceCasting(input, get);
	}
}

// Defines
const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numChars = '0123456789';

declare global {
	interface Array<T> {
		readonly randomElement: T;
		get(subString: string): Array<T>;
		readonly lastElement: T;
	}
	interface Number {
		// number
		readonly floor: number;
		readonly round: number;
		readonly abs: number;

		// string
		readonly alpha: string;
		readonly numeric: string;
		readonly string: string;

		// utils
		readonly random: number;
		ra(input: () => Promise<any>): Promise<void>; // range() # like Python's range()
	}
	interface String {
		readonly randomChar: string;
	}

	/**
	 * Return the formatted name of current file
	 * @param {string} file - the current file's name (must be __filename)
	 * @param {number} cut - How many chunk should get (default: 2)
	 * @return {string} formatted file's name
	 */
	function curFile(file: string, cut?: number): string;
	/**
	 * Return an array with length
	 * @param {number} length - the length of the array
	 * @param {any} initValue - the initial value for each element in array
	 * @return {any[]} the output array with length
	 */
	function array(length: number, initValue?: any): any[];
}

// Global functions
global.curFile = (file: string, cut = 2) =>
	file
		.split(/\/|\\/)
		.lastElement.split('.')
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.slice(0, cut)
		.join('');
global.array = (length: number, initValue: any = '') =>
	Array(length)
		.join()
		.split(',')
		.map(() => initValue);
// String.prototype
Object.defineProperty(String.prototype, 'randomChar', {
	get: function () {
		return (this as string).charAt((this as string).length.random);
	},
	enumerable: true,
	configurable: true,
});
// Array.prototype
Array.prototype.get = function (subString: string) {
	return this.filter((i: string) => i.includes(subString));
};
Object.defineProperty(Array.prototype, 'randomElement', {
	get: function () {
		return this[this.length.random];
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Array.prototype, 'lastElement', {
	get: function () {
		return this[this.length - 1];
	},
	enumerable: true,
	configurable: true,
});
// Number.prototype
Number.prototype.ra = async function (input: () => Promise<any>) {
	await Array.from({ length: Number(this) }, (_, i) => i).reduce(async (i) => {
		await i;
		return input();
	}, Promise.resolve());
};
Object.defineProperty(Number.prototype, 'random', {
	get: function () {
		return Math.floor(Math.random() * (this as number));
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'alpha', {
	get: function () {
		return array(this)
			.map(() => alphaChars.randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'string', {
	get: function () {
		return array(this)
			.map(() => (alphaChars + numChars).randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'numeric', {
	get: function () {
		return array(this)
			.map(() => numChars.randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'floor', {
	get: function () {
		return Math.floor(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'round', {
	get: function () {
		return Math.round(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'abs', {
	get: function () {
		return Math.abs(this);
	},
	enumerable: true,
	configurable: true,
});
