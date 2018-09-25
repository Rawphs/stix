import { ControllerManager, ControllerManagerFactory } from '../../../src/Library/Controller';
import { ServiceManager, ServiceManagerConfigType } from '../../../src/Library/ServiceManager';
import * as config from '../../../src/config';
import { Config } from '../../../src/Library/Config';

describe('ControllerManagerFactory', () => {
  it('should return a new ControllerManager instance', () => {
    const controller = {
      controllers: {
        factories: new Map()
      },
    };

    const serviceManagerConfig: ServiceManagerConfigType = {
      services: new Map([
        [ Config, new Config(config, { controller })]
      ])
    };

    const serviceManager    = new ServiceManager(serviceManagerConfig);
    const controllerManager = ControllerManagerFactory(serviceManager);

    expect(controllerManager).toBeInstanceOf(ControllerManager);
  });
});
