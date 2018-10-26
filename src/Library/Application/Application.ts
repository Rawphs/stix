import { ServerService } from '../Server';
import { ModuleManager, ModuleManagerFactory } from '../ModuleManager';
import { Config, ConfigType } from '../Config';
import { FactoryInterface, ServiceManager } from '../ServiceManager';
import { EventManager, EventManagerFactory, SharedEventManager } from '../EventManager';
import { ApplicationEvents } from './ApplicationEvents';
import { Instantiable } from '../Core';
import { createDebugLogger } from '../../debug';
import * as defaultConfig from '../../config';
import { CliService } from '../Cli';
import { ApplicationModes } from './ApplicationModes';

const debug = createDebugLogger('application');

/**
 * This class is Stix's heart.
 * It is responsible for:
 *   - Pass in the provided configuration to be handled by the Config class
 *   - Instantiating the Service Manager with vital services and factories registered
 *   - Bootstrapping the application
 *   - Starting the server
 */
export class Application {

  private mode: ApplicationModes;

  private readonly environment: string = process.env.NODE_ENV || 'development';

  private readonly config: Config;

  private readonly serviceManager: ServiceManager;

  private readonly applicationConfigs: ConfigType[];

  private moduleManager: ModuleManager;

  private sharedEventManager: SharedEventManager;

  /**
   * The constructor creates new instances of {@link Config} and {@link ServiceManager}.
   * In the Config constructor, the provided config will be merged to the defaultConfig.
   * The config provided by you can contain routes, controllers, references to installed modules
   * and/or settings to override defaults, for example. The Service Manager constructor will be
   * responsible for setting core services and factories.
   *
   * @param appConfigs An array of configs from your application
   */
  public constructor (...appConfigs: ConfigType[]) {
    this.applicationConfigs = appConfigs;
    this.config             = new Config(defaultConfig, ...this.applicationConfigs);
    this.serviceManager     = new ServiceManager({
      aliases: { config: Config, sharedEventManager: SharedEventManager },
      invokables: new Map<Instantiable<Object>, Instantiable<Object>>([
        [ SharedEventManager, SharedEventManager ],
      ]),
      factories: new Map<Function, FactoryInterface>([
        [ ModuleManager, ModuleManagerFactory ],
        [ EventManager, EventManagerFactory ],
      ]),
      services: new Map<Function, Object>([
        [ Config, this.config ],
        [ Application, this ],
      ]),
      shared: new Map<Function, boolean>([
        [ EventManager, false ],
      ]),
    });
  }

  /**
   * Returns the Application mode (CLI or Server)
   */
  public getMode (): ApplicationModes {
    return this.mode;
  }

  /**
   * Returns the instantiated Service Manager
   */
  public getServiceManager (): ServiceManager {
    return this.serviceManager;
  }

  /**
   * This async method is responsible for loading modules and registering essential services.
   * After all modules are loaded and the core's middleware are set,
   * we bootstrap every registered module that we found in the config.
   * After everything is done we emit a `'ready'` event, which allows the listeners to execute before the server starts.
   *
   * @param mode The application mode
   * @param loadOnly Flag that indicates that the server shouldn't start (used for CLI)
   */
  private async bootstrap (mode: ApplicationModes, loadOnly: boolean = false): Promise<this> {
    const config = this.config;

    // Make the module manager. Only one level is allowed to specify module configs..
    this.moduleManager = this.serviceManager.get(ModuleManager);

    // Initialize module manager. Only calls getConfig()
    await this.moduleManager.loadModules(config.of('modules'));

    // Now let's patch on the user config once more, to ensure dominance.
    this.config.merge(...this.applicationConfigs);

    // Now that we have all the configs, register the services.
    this.serviceManager.configure(config.of('services'));

    // go forth and create all core services.
    this.sharedEventManager = this.serviceManager.get(SharedEventManager);

    if (mode === ApplicationModes.Cli) {
      await this.bootstrapCli();
    } else {
      this.bootstrapServer();
    }

    // Don't start the application. We're probably in CLI mode.
    if (loadOnly) {
      return this;
    }

    return await this.start();
  }

  /**
   * Bootstraps the modules and dispatch Ready event, allowing listeners to do some work before starting the server.
   */
  public async start (): Promise<this> {
    // Cool cool. Bootstrap the modules, because they can now get all the things.
    await this.moduleManager.bootstrap();

    // Allow listeners to do some work before starting the server.
    await this.sharedEventManager.trigger(ApplicationEvents.Ready, this);

    return this;
  }

  /**
   * Bootstraps the application in cli mode.
   */
  private async bootstrapCli () {
    const cliService = await this.serviceManager.get(CliService);

    this.sharedEventManager.attachOnce(ApplicationEvents.Ready, () => {
      cliService.execute(process.argv.slice(2));
    });
  }

  /**
   * Bootstraps the application in server mode.
   */
  private bootstrapServer () {
    const serverService = this.serviceManager.get(ServerService);

    this.sharedEventManager.attachOnce(ApplicationEvents.Ready, () => {
      serverService.start();
    });
  }

  /**
   * Returns the current environment in which Stix is running.
   */
  public getEnvironment (): string {
    return this.environment;
  }

  /**
   * Returns whether or not the current environment is production.
   */
  public isProduction (): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * Asynchronously launches the application.
   * This method first calls bootstrap and, when that is done, starts the server.
   *
   * @param mode The application mode
   * @param loadOnly Flag that indicates that the server shouldn't start (used for CLI)
   */
  public async launch (mode: ApplicationModes = ApplicationModes.Server, loadOnly: boolean = false): Promise<this> {
    this.config.merge({ application: { mode } });

    this.mode = mode;

    debug(`Launching in ${mode} mode`);

    await this.bootstrap(mode, loadOnly);

    debug('Application ready.');

    return this;
  }
}
