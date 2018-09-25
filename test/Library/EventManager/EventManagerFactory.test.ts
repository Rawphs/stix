import { EventManager, EventManagerFactory, SharedEventManager } from '../../../src/Library/EventManager';
import { ServiceManager } from '../../../src/Library/ServiceManager';

describe('EventManagerFactory', () => {
  it('should return an EventManager instance without sharedEventManager', () => {
    const serviceManager = new ServiceManager;
    const eventManager = EventManagerFactory(serviceManager);

    expect(eventManager).toBeInstanceOf(EventManager);
    expect(eventManager.getSharedEventManager()).toBeNull();

  });

  it('should return an EventManager instance with sharedEventManager', () => {
    const sharedEventManager = new SharedEventManager;
    const serviceManager     = new ServiceManager({
      services: new Map([
        [ SharedEventManager, sharedEventManager ],
      ]),
    });
    const eventManager       = EventManagerFactory(serviceManager);

    expect(eventManager).toBeInstanceOf(EventManager);
    expect(eventManager.getSharedEventManager()).toBe(sharedEventManager);
  });
});
