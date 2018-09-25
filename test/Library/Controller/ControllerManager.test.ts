import path from 'path';
import { ControllerManager } from '../../../src/Library/Controller';
import { ServiceManager, ServiceManagerConfigType } from '../../../src/Library/ServiceManager';
import { ControllerManagerConfigType } from '../../../src/Library/Config';
import { response } from '../../../src/config';
import { UserController, ProfileController, } from '../../Resources';
import TypescriptExport from '../../Resources/Controllers/Types/TypescriptDefaultExport';
import { ResponseService } from '../../../src/Library/Response';
const NodeExport = require('../../Resources/Controllers/Types/NodeDefaultExport');

describe('ControllerManager', () => {
  const serviceManagerConfig: ServiceManagerConfigType = {
    services: new Map([
      [ ResponseService, new ResponseService(response)],
    ]),
  };
  const serviceManager: ServiceManager = new ServiceManager(serviceManagerConfig);

  describe('.constructor()', () => {
    it('should instantiate without configured controllers', () => {
      expect(() => new ControllerManager(serviceManager, {})).not.toThrowError();
    });

    it('should instantiate with explicitly declared controllers', () => {
      const controllers: ControllerManagerConfigType = {
        controllers: {
          factories: new Map([
            [ UserController, () => new UserController ]
          ]),
        },
      };

      const controllerManager: ControllerManager = new ControllerManager(serviceManager, controllers);

      expect(controllerManager.has(UserController)).toBe(true);
    });

    it('should instantiate with controllers locations without errors', () => {
      const basePath = [ __dirname, '..', '..', 'Resources', 'Controllers' ];

      const controllers: ControllerManagerConfigType = {
        locations: [ path.resolve(...basePath, 'User'), path.resolve(...basePath, 'Types') ],
      };

      const controllerManager: ControllerManager = new ControllerManager(serviceManager, controllers);

      expect(controllerManager.has(UserController)).toBe(true);
      expect(controllerManager.has(ProfileController)).toBe(true);
      expect(controllerManager.has(TypescriptExport)).toBe(true);
      expect(controllerManager.has(NodeExport)).toBe(true);
      expect(controllerManager.get(UserController)).toBeInstanceOf(UserController);
      expect(controllerManager.get(ProfileController)).toBeInstanceOf(ProfileController);
      expect(controllerManager.get(TypescriptExport)).toBeInstanceOf(TypescriptExport);
      expect(controllerManager.get(NodeExport)).toBeInstanceOf(NodeExport);
    });
  });

  describe('ControllerManager.getControllerName()', () => {
    it('should get the controller name when given controller name is a class', () => {
      expect(ControllerManager.getControllerName(UserController)).toEqual('UserController');
    });

    it('should return itself if controller name is a string', () => {
      expect(ControllerManager.getControllerName('ProfileController')).toEqual('ProfileController');
    });
  });

  describe('.loadDirectory()', () => {
    it('should throw error if controller was not exported correctly', () => {
      const controllers: ControllerManagerConfigType = {
        locations: [ path.resolve( __dirname, '..', '..', 'Resources', 'Controllers', 'WrongController') ],
      };

      expect(() => new ControllerManager(serviceManager, controllers))
        .toThrowError('Unable to load controller "NoExport" due to missing constructable export.');
    });
  });
});
