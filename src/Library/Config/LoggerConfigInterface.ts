import { LoggerOptions } from 'winston';

/**
 * The Logger config interface extends the logger options from winston.
 * That way, if you choose to extend the Logger class, you can also have access to the correct types
 * without having to import them from another module.
 */
export interface LoggerConfigInterface extends LoggerOptions {

}
