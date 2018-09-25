import { LoggerService } from '../../../src/Library/Logger';
import { logger } from '../../../src/config';

describe('LoggerService', () => {
  it('should create a new instance passing the logger config to the adapter', () => {
    const loggerService = new LoggerService(logger);

    expect(loggerService.getAdapter()).not.toBeUndefined();
  });
});
