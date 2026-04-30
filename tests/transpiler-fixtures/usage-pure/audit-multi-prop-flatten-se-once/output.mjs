import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// nested-proxy declarator flatten with multiple polyfilled props sharing one SE-bearing
// receiver. each polyfilled prop visits the declarator independently; the SE prefix
// must be lifted exactly ONCE - re-lifting per-visit would duplicate the side effect's
// runtime evaluation (semantics drift from user's source: `sideEffect()` would fire N
// times instead of once)
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
sideEffect();
const from = _Array$from;
const keys = _Object$keys;