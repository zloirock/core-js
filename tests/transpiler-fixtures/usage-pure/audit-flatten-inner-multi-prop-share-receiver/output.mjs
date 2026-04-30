import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// inner multi-prop variant: two polyfilled inner props (`from`, `of`) share one outer
// prop and one SE-bearing receiver. each inner-prop visit walks the same declarator;
// without the init mutation the second visit re-peels `(sideEffect(), globalThis)` and
// duplicates the lifted statement
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
sideEffect();
const from = _Array$from;
const of = _Array$of;