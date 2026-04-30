import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// multi-SE prefix chain: two side effects both lift exactly once, in source order. each
// polyfilled prop's visit must observe the already-trimmed init; without the mutation
// the second visit re-peels both effects and emits a duplicate pair
let counter = 0;
const se1 = () => counter++;
const se2 = () => counter += 10;
se1();
se2();
const from = _Array$from;
const keys = _Object$keys;