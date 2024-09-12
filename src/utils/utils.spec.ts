import { Role } from 'user/user.model';
import './utils';
import { matching } from './utils';

describe('Number', () => {
	describe('char', () => {
		it('generate a random string with length', () => {
			const randomLength = (100).rd();
			expect(randomLength.char().length).toEqual(randomLength);
		});
	});
});

describe('matching', () => {
	describe('return true', () => {
		it('case #1', () => {
			expect(matching([Role.ADMIN], [Role.ADMIN])).toEqual(true);
		});

		it('case #2', () => {
			expect(matching([Role.ADMIN, Role.USER], [Role.ADMIN])).toEqual(true);
		});

		it('case #3', () => {
			expect(
				matching([Role.ADMIN, Role.USER], [Role.ADMIN, Role.USER]),
			).toEqual(true);
		});
	});

	describe('return false', () => {
		it('case #1', () => {
			expect(matching([Role.ADMIN], [Role.USER])).toEqual(false);
		});

		it('case #2', () => {
			expect(matching([Role.ADMIN], [Role.ADMIN, Role.USER])).toEqual(false);
		});

		it('case #3', () => {
			expect(
				matching([Role.ADMIN, Role.USER], [Role.ADMIN, Role.STAFF]),
			).toEqual(false);
		});
	});
});
