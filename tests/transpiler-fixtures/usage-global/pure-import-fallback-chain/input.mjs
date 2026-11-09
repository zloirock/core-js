// Global mode leaves reads of pure imports untouched, including fallback aliases.
// Full, narrow and older namespaces must not introduce patches to the native globals.
import Full from '@core-js/pure/full/promise';
import Narrow from '@core-js/pure/actual/promise/constructor';
import ES from '@core-js/pure/es/promise';
const base = Full ?? AggregateError;
const C = base ?? Iterator;
export const fromFull = C.try(task);
const narrow = Narrow ?? Error;
const N = narrow ?? Iterator;
export const fromNarrow = N.withResolvers();
const older = ES ?? Object;
const E = older ?? WeakMap;
export const fromES = E.allKeyed(entries);
