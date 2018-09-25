import { Event } from '../../../src/Library/EventManager';
import { Application, ApplicationEvents } from '../../../src/Library/Application';

describe('Event', () => {
  it('should create a new event and store given arguments', () => {
    const event = new Event<Application>(ApplicationEvents.Ready, Application, 'I am so ready for you');

    expect(event.getEvent()).toBe(ApplicationEvents.Ready);
    expect(event.getTarget()).toBe(Application);
    expect(event.getPayload()).toBe('I am so ready for you');
  });
});
