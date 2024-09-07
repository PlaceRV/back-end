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
 * @param {{type: K; params: Parameters<jest.Matchers<Promise<T>>[K]>}[]} exps - expectations that function will return
 */
export async function execute<K extends keyof jest.Matchers<any>>(
	func: Promise<any>,
	throwError: boolean,
	exps: { type: K; params: Parameters<jest.Matchers<any>[K]> }[],
) {
	const result = throwError ? expect(func).rejects : expect(await func);
	for (const exp of exps) await result[exp.type].apply(null, exp.params);
}
