import { ServiceManager } from '../../../src/Library/ServiceManager';
import { LoggerService, LoggerServiceFactory } from '../../../src/Library/Logger';
import { Config } from '../../../src/Library/Config';
import { logger } from '../../../src/config';

describe('LoggerServiceFactory', () => {
  it('should instantiate the LoggerFactory', () => {
    const serviceManagerConfig = {
      services: new Map([
        [ Config, new Config(logger) ]
      ]),
    };
    const serviceManager = new ServiceManager(serviceManagerConfig);

    const loggerService = LoggerServiceFactory(serviceManager);

    expect(loggerService).toBeInstanceOf(LoggerService);
  });
});
