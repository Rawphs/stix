import { EventManager, SelfDestructingCallbackInterface, SharedEventManager, Event } from '../../../src/Library/EventManager';
import { Application, ApplicationEvents } from '../../../src/Library/Application';

describe('EventManager', () => {
  it('should instantiate without shared EventManager', () => {
    expect(() => new EventManager).not.toThrowError();
  });

  it('should instantiate with shared EventManager', () => {
    const sharedEventManager = new SharedEventManager();
    const eventManager = new EventManager(sharedEventManager);

    expect(() => eventManager).not.toThrowError();
    expect(eventManager.getSharedEventManager()).toBe(sharedEventManager);
  });

  it('should add hook to the listeners of given event', () => {
    const hey          = jest.fn();
    const hello        = jest.fn();
    const greetings    = jest.fn();
    const eventManager = new EventManager;

    eventManager.attach(ApplicationEvents.Ready, hey);
    eventManager.attach(ApplicationEvents.Ready, greetings, 0);

    expect(eventManager.has(ApplicationEvents.Ready, hey)).toBe(true);
    expect(eventManager.has(ApplicationEvents.Ready, greetings)).toBe(true);
    expect(eventManager['hooks'][ApplicationEvents.Ready][0]).toBe(greetings);
    // returns `this`
    expect(eventManager.attach(ApplicationEvents.Ready, hello)).toBe(eventManager);
  });

  it('should set listener to self destruct', () => {
    const hey       = jest.fn();

    const eventManager = new EventManager;

    eventManager.attachOnce(ApplicationEvents.Ready, hey);

    const callback = eventManager['hooks'][ApplicationEvents.Ready][0] as SelfDestructingCallbackInterface;

    expect(callback._isSelfDestructingCallback).toBe(true);
  });

  it('should attach at specified index using convenience method', () => {
    const hey          = jest.fn();
    const hello        = jest.fn();
    const greetings    = jest.fn();
    const eventManager = new EventManager;

    eventManager.attach(ApplicationEvents.Ready, hey);
    eventManager.attach(ApplicationEvents.Ready, hello);
    eventManager.attachAt(1, ApplicationEvents.Ready, greetings);

    const callbacks = eventManager['hooks'][ApplicationEvents.Ready];

    expect(callbacks[0]).toBe(hey);
    expect(callbacks[1]).toBe(greetings);
    expect(callbacks[2]).toBe(hello);
  });

  it('should detach attached hooks', () => {
    const hey          = jest.fn();
    const hello        = jest.fn();
    const greetings    = jest.fn();
    const eventManager = new EventManager;

    eventManager.attach(ApplicationEvents.Ready, hey);
    eventManager.attach(ApplicationEvents.Ready, hello);
    const detach = eventManager.detach(ApplicationEvents.Ready, hey);

    // detaching hook that wasn't previously attached to this event
    const detachUnregistered = eventManager.detach(ApplicationEvents.Ready, greetings);

    const callbacks = eventManager['hooks'][ApplicationEvents.Ready];

    expect(callbacks.length).toEqual(1);
    expect(eventManager.has(ApplicationEvents.Ready, hey)).toBe(false);
    expect(eventManager.has(ApplicationEvents.Ready, hello)).toBe(true);
    expect(detach).toBe(eventManager);
    expect(detachUnregistered).toBe(eventManager);
    expect(() => detachUnregistered).not.toThrowError();
  });

  it('should execute hooks when event is triggered and clear self destructing hooks', async () => {
    const hey          = jest.fn();
    const hello        = jest.fn();
    const greetings    = jest.fn();
    const eventManager = new EventManager;
    const event        = new Event<Application>(ApplicationEvents.Ready, Application, 'I feel so triggered');

    eventManager.attach(ApplicationEvents.Ready, hey);
    eventManager.attach(ApplicationEvents.Ready, hello);
    eventManager.attachOnce(ApplicationEvents.Ready, greetings);

    const trigger = await eventManager.trigger(ApplicationEvents.Ready, Application, 'I feel so triggered');

    expect(hey).toBeCalledWith(event);
    expect(hello).toBeCalledWith(event);
    expect(greetings).toBeCalledWith(event);
    expect(eventManager.has(ApplicationEvents.Ready, greetings)).toBe(false);
    expect(eventManager.has(ApplicationEvents.Ready, hey)).toBe(true);
    expect(eventManager.has(ApplicationEvents.Ready, hello)).toBe(true);
    expect(trigger).toBe(true);
  });

  it('should remove event key from hooks if there are no hooks left to execute', async () => {
    const hey          = jest.fn();
    const hello        = jest.fn();
    const eventManager = new EventManager;

    eventManager.attachOnce(ApplicationEvents.Ready, hey);
    eventManager.attachOnce(ApplicationEvents.Ready, hello);

    const trigger = await eventManager.trigger(ApplicationEvents.Ready, Application, 'I feel so triggered');

    expect(trigger).toBe(true);
    expect(eventManager['hooks'][ApplicationEvents.Ready]).toBe(undefined);
  });

  it('should return false if triggered event had no hooks attached to it', async () => {
    const eventManager = new EventManager;
    const trigger      = await eventManager.trigger(ApplicationEvents.Ready, Application, 'I feel so triggered');

    expect(trigger).toBe(false);
  });
});
