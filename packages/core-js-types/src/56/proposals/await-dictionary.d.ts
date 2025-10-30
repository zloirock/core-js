// proposal stage: 1
// https://github.com/tc39/proposal-await-dictionary
import { CoreJsPromiseSettledResult } from '../core-js-types/core-js-types';

type Dict<V> = { [k: string | symbol]: V };

declare global {
  interface PromiseConstructor {
    allKeyed<D extends Dict<Promise<any>>>(promises: D): Promise <{ [k in keyof D]: Awaited<D[k]> }>;

    allSettledKeyed<D extends Dict<Promise<any>>>(promises: D): Promise <{ [k in keyof D]: CoreJsPromiseSettledResult<Awaited<D[k]>> }>;
  }
}

export {};
