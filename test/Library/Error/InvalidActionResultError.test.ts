import { InvalidActionResultError } from '../../../src/Library/Error';

describe('InvalidActionResultError', () => {
  it('should throw InvalidActionResult Error', () => {
    const error = new InvalidActionResultError('Invalid, yo');

    expect(error).toBeInstanceOf(Error);
    expect(() => {throw error}).toThrowError('Invalid, yo');
  });
});
