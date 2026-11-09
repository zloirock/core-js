import _Promise$allKeyed from "@core-js/pure/full/promise/all-keyed";
import _Promise from "@core-js/pure/full/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/full/promise/with-resolvers";
// A full imported constructor supplies its statics through fallback aliases. A narrow constructor
// and an older namespace keep their separate method imports when that entry lacks the method.
import Full from '@core-js/pure/full/promise';
import Narrow from '@core-js/pure/actual/promise/constructor';
import ES from '@core-js/pure/es/promise';
const base = Full;
const C = base;
export const fromFull = C.try(task);
const narrow = Narrow;
const N = narrow;
export const fromNarrow = (N === _Promise ? _Promise$withResolvers : N.withResolvers.bind(N))();
const older = ES;
const E = older;
export const fromES = (E === _Promise ? _Promise$allKeyed : E.allKeyed.bind(E))(entries);