// A full imported constructor supplies its statics through fallback aliases. A narrow constructor
// and an older namespace keep their separate method imports when that entry lacks the method.
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
