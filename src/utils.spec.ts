import './utils';

describe('utils', () => {
	describe('Global', () => {
		describe('Number', () => {
			describe('char', () => {
				it('generate a random string with length', () => {
					const randomLength = (100).rd();
					expect(randomLength.char().length).toEqual(randomLength);
				});
			});
		});
	});
});
