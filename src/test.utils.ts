// ? The spy function ment to initiate functions need to be hooked
export const spy = <T extends Record<string, any>>(
	arr: { obj: T; key: (keyof T)[] }[],
) =>
	arr.forEach(({ obj, key }) =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		key.forEach((k) => jest.spyOn(obj, k.toString())),
	);

interface Expectation {
	type: keyof jest.Matchers<any>;
	params: Parameters<jest.Matchers<any>[keyof jest.Matchers<any>]>;
	not?: boolean;
	debug?: boolean;
}

/**
 * A function run async functions and catch both throw errors and results
 * @param {Promise<T>} func - the function to test
 * @param {boolean} throwError - is the function going to throw errors?
 * @param {Expectation[]} exps - expectations that function will return
 */
export async function execute(
	func: Promise<any>,
	throwError: boolean,
	exps: Expectation[],
) {
	let funcResult: any;
	const result = throwError
		? expect(func).rejects
		: expect((funcResult = await func));
	if (exps.some((i) => i.debug)) console.log(funcResult);
	for (const exp of exps) {
		await (exp.not ? result.not : result)[exp.type].apply(null, exp.params);
	}
}
