/** reports a condition to the developer once, however many times it is hit */
type Warn = (condition: string, message: string) => boolean;

interface Options {
  /** where developer-facing warnings go, by default `console.warn`. deduplication is applied
   *  before the message reaches it, so an application logger can be passed as it is */
  warn?: ((message: string) => void) | null;
}

interface Service {
  warn: Warn;
}

declare function createService(options?: Options): Service;

export default createService;
