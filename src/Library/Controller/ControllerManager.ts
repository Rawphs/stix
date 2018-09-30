import { ControllerManagerConfigType } from '../Config';
import { ServiceManager, AbstractFileBasedPluginManager } from '../ServiceManager';
import { Instantiable } from '../Core';

export class ControllerManager extends AbstractFileBasedPluginManager {
  constructor (creationContext: ServiceManager, config: ControllerManagerConfigType) {
    super(creationContext, config.locations, config.controllers);
  }

  public getController (Controller: Instantiable<Object>): Object {
    return this.getPlugin(Controller);
  }
}
