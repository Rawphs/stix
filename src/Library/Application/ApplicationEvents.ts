/**
 * Application-level events that modules, services and factories can listen to.
 */
export enum ApplicationEvents {
  /**
   * This event is dispatched after the application was completely bootstrapped.
   * You can listen for this event if you need to execute a hook right before the application launches.
   */
  Ready = 'Application.Ready',
}
