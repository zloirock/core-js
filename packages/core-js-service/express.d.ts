import type createService from "./index.js";

type Options = Parameters<typeof createService>[0];
type Service = ReturnType<typeof createService>;

type Middleware = ((request: any, response: any, next: (error?: unknown) => void) => Promise<void>) & {
  /** the service the middleware runs on - the plan, the store and `chooseBundle` */
  service: Service;
};

/** the Express middleware: it answers the bundle route and puts the tag into HTML responses.
 *  register it AFTER `compression`, not before - the one registered later sees the body first */
declare function polyfillService(options: Options): Middleware;

export default polyfillService;
