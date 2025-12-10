// proposal stage: 4
// https://github.com/tc39/proposal-promise-allSettled

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2020.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

import { CoreJSPromiseSettledResult } from '../core-js-types/core-js-types';

declare global {
  interface PromiseConstructor {
    allSettled<T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: CoreJSPromiseSettledResult<Awaited<T[P]>>; }>;

    allSettled<T>(values: Iterable<T | PromiseLike<T>>): Promise<CoreJSPromiseSettledResult<Awaited<T>>[]>;
  }
}

export {};
