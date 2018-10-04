import parser from 'yargs-parser';
import { CliConfigType } from './CliConfigType';
import {
  CliCommandType,
  CliProgramConfigType,
  CliProgramType,
  ParsedCommandType,
  ProcessedProgramType,
} from './CliTypes';
import { CommandManager } from '../Command';
import { Output } from '../Output';

export class CliService {
  private readonly config: CliConfigType;

  private programs: { [program: string]: ProcessedProgramType } = {};

  /**
   * Lookup index linking to commands in programs.
   */
  private commands: { [token: string]: CliCommandType } = {};

  private commandManager: CommandManager;

  constructor (commandManager: CommandManager, config: CliConfigType = {}) {
    this.config = config;
    this.commandManager = commandManager;

    if (config.commands) {
      this.registerPrograms(config.commands);
    }
  }

  resolveToken (args: { _: string[], [key: string]: string[] | string }) {
    if (args.help) {
      return this.config.fallbackToken;
    }

    return args._.shift() || this.config.fallbackToken;
  }

  public async execute (argv: string[]) {
    const output = await this.resolve(argv);

    output.send();
  }

  private async resolve (argv: string[]): Promise<Output> {
    const parsed = parser(argv, { alias: { h: 'help' } });
    const token = this.resolveToken(parsed);
    const command = this.commands[token] as CliCommandType;
    const output = new Output();

    // Remove the token so we're left with the arguments.
    if (token === argv[0]) {
      argv.splice(0, 1);
    }

    if (!command) {
      return output.error(`Unknown command "${token}".`);
    }

    const commandInstance = this.commandManager.getCommand(command.Command) as { [key: string]: Function };

    try {
      await commandInstance[command.action]({ params: this.validate(argv, command) }, output);
    } catch (error) {
      output.error(error);
    }

    return output;
  }

  private validate (argv: string[], command: CliCommandType) {
    const alias = this.collectAliases(command);
    const parsed = parser(argv, { alias });

    const args: { [key: string]: string } = {};

    if (Array.isArray(command.args)) {
      command.args.forEach(({ required, name }: { name: string, required: boolean }, index: number) => {
        if (required && !parsed._[index]) {
          throw `Missing required argument "${name}".`;
        }

        if (parsed._[index]) {
          args[name] = parsed._[index];
        }
      });
    }

    if (!command.config || !command.config.options) {
      return args;
    }

    Object.keys(command.config.options).forEach(option => {
      if (command.config.options[option].required && !parsed[option]) {
        throw `Missing required option "${option}".`;
      }

      args[option] = parsed[option];
    });

    return args;
  }

  private collectAliases ({ config }: CliCommandType) {
    if (!config || !config.options) {
      return {};
    }

    return Object.keys(config.options).reduce((aliases: { [key: string]: string }, name: string) => {
      if (config.options[name].alias) {
        aliases[name] = config.options[name].alias;
      }

      return aliases;
    }, {});
  }

  public getPrograms (): { [program: string]: ProcessedProgramType } {
    return this.programs;
  }

  public getCommands (): { [token: string]: CliCommandType } {
    return this.commands;
  }

  public getCommand (command: string): CliCommandType {
    return this.commands[command];
  }

  public getConfig (): CliConfigType {
    return this.config;
  }

  private registerPrograms (programs: Array<CliProgramType | CliCommandType>) {
    programs.forEach((programEntry: CliProgramType | CliCommandType) => {

      const programName = (programEntry as CliProgramType).program || this.config.defaultProgramName;
      const programConfig = (programEntry.config || { commands: [ programEntry ] }) as CliProgramConfigType;
      this.registerProgram(programName, programConfig);
    });
  }

  private registerProgram (program: string, { commands, examples }: CliProgramConfigType) {
    if (!this.programs[program]) {
      this.programs[program] = { program, examples, commands: {} };
    }

    commands.forEach((command: CliCommandType) => {
      const { token, args } = this.queParser(command.commandLine);

      command.args = args;
      command.token = token;

      this.programs[program].commands[token] = command;
      this.commands[token] = command;
    });
  }

  private queParser (commandLine: string): ParsedCommandType {
    return commandLine.split(' ').reduce((parsed: ParsedCommandType, value) => {
      if (value[0] === '<' && value[value.length - 1] === '>') {
        parsed.args.push({ required: true, name: value.slice(1, -1) });
      } else if (value[0] === '[' && value[value.length - 1] === ']') {
        parsed.args.push({ required: false, name: value.slice(1, -1) });
      } else {
        parsed.token = value;
      }

      return parsed;
    }, { args: [] }) as ParsedCommandType;
  }
}
