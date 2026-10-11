// a pure import of a whole namespace carries the statics its own level ships, and a read of one of those
// stays as written, directly or through an alias. a static that level lacks - a proposal under `es` -
// takes its own entry: `es/promise` has no `Promise.allKeyed`, while `actual/promise` has it
import EsPromise from '@core-js/pure/es/promise';
import ActualPromise from '@core-js/pure/actual/promise';
const held = EsPromise;
export const keyed = held.allKeyed({ a: 1 });
export const settledKeyed = EsPromise.allSettledKeyed({ b: 2 });
export const settled = held.allSettled([]);
const actual = ActualPromise;
export const actualKeyed = actual.allKeyed({ c: 3 });
