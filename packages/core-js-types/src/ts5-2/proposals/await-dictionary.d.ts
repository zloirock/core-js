// proposal stage: 1
// https://github.com/tc39/proposal-await-dictionary

import { CoreJSPromiseSettledResult } from '../core-js-types/core-js-types';

declare global {
  interface PromiseConstructor {
    allKeyed<D extends Record<PropertyKey, Promise<any>>>(promises: D): Promise <{ [k in keyof D]: Awaited<D[k]> }>;

    allSettledKeyed<D extends Record<PropertyKey, Promise<any>>>(promises: D): Promise <{ [k in keyof D]: CoreJSPromiseSettledResult<Awaited<D[k]>> }>;
  }
}

export {};
