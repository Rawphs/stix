import { NotFoundError } from '../../../src/Library/Error';

describe('NotFoundError', () => {
  it('should throw InvalidActionResult Error', () => {
    const error = new NotFoundError('Are you sure it is here?');

    expect(error).toBeInstanceOf(Error);
    expect(() => {throw error}).toThrowError('Are you sure it is here?');
  });
});
