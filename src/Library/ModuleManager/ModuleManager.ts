import { Config, ModuleManagerConfigInterface } from '../Config';
import createDebugLogger from '../../debug';
import { EventManager } from '../EventManager';
import { ModuleManagerEvents } from '../EventManager/ModuleManagerEvents';
import { ModuleClassInterface } from './ModuleClassInterface';
import { Application } from '../Application';

const debug = createDebugLogger('modules');

export class ModuleManager {
  private readonly config: Config;

  private readonly eventManager: EventManager;

  private readonly application: Application;

  constructor(application: Application, eventManager: EventManager, config: Config) {
    this.application  = application;
    this.eventManager = eventManager;
    this.config       = config;
  }

  public async bootstrap () {
    return await this.eventManager.trigger(ModuleManagerEvents.OnBootstrap, this);
  }

  public async loadModule(ModuleClass: ModuleClassInterface): Promise<this> {
    debug('Loading module ' + ModuleClass.name);

    const eventManager = this.eventManager;
    const module       = new ModuleClass();

    if (typeof module.getConfig === 'function') {
      this.config.merge(await module.getConfig());
    }

    if (typeof module.init === 'function') {
      module.init(this);
    }

    // Allow for a convenience onBootstrap method.
    if (typeof module.onBootstrap === 'function' && !eventManager.has(ModuleManagerEvents.OnBootstrap, module.onBootstrap)) {
      eventManager.attachOnce(ModuleManagerEvents.OnBootstrap, module.onBootstrap);
    }

    debug('Bootstrapped module ' + ModuleClass.name);

    return this;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }

  public getApplication(): Application {
    return this.application;
  }

  public async loadModules(config: ModuleManagerConfigInterface): Promise<this> {
    debug('Loading modules');

    for(let i = 0; i < config.length; i++) {
      await this.loadModule(config[i]);
    }

    debug('Loaded modules');

    return this;
  }
}
