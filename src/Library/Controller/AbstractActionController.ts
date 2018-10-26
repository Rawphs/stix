import { AbstractResponseHelper } from '../Response';

/**
 * The AbstractActionController is an abstract class (Who would have guessed?) that, being extended by a controller, injects the ResponseService along with some convenient methods for the most used response types. If your desired response is not among these helpers, you can access the ResponseService itself to access all available responses:
 *
 * ```ts
 * export class MyController extends AbstractActionController {
 *   find(ctx) {
 *   // you do your magic
 *
 *   return this.getResponseService().clientError().iAmATeapot('Make your own coffee');
 *   }
 * }
 * ```
 */
export class AbstractActionController extends AbstractResponseHelper {
}
