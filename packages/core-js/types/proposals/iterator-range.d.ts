// proposal stage: 2
// https://github.com/tc39/proposal-Number.range

import { CoreJsIteratorObject } from './core-js-types/core-js-types';

declare global {
  type RangeOptionsNumber = {
    step?: number;
    inclusive?: boolean;
  };

  type RangeOptionsBigInt = {
    step?: bigint;
    inclusive?: boolean;
  };

  interface IteratorConstructor {
    range(start: number, end: number, options?: number | RangeOptionsNumber): CoreJsIteratorObject<number>;

    range(start: bigint, end: bigint | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: bigint | RangeOptionsBigInt): CoreJsIteratorObject<bigint>;
  }

  var Iterator: IteratorConstructor;
}

export {};
