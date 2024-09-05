// ? The spy function ment to initiate functions need to be hooked
export const spy = <T extends Record<string, any>>(
	arr: { obj: T; key: (keyof T)[] }[],
) =>
	arr.forEach(({ obj, key }) =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		key.forEach((k) => jest.spyOn(obj, k.toString())),
	);

/**
 * A function run async functions and catch both throw errors and results
 * @param {Promise<T>} func - the function to test
 * @param {boolean} throwError - is the function going to throw errors?
 * @return {jest.JestMatchers<T | Promise<T>> | jest.AndNot<jest.Matchers<Promise<void>, T | Promise<T>>>} the function tester
 */
export async function execute<T>(
	func: Promise<T>,
	throwError: boolean = false,
): Promise<
	| jest.JestMatchers<Promise<T>>
	| jest.AndNot<jest.Matchers<Promise<void>, Promise<T>>>
> {
	return throwError
		? expect((async () => await func)()).rejects
		: expect(await (async () => await func)());
}
