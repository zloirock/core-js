import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise$all from "@core-js/pure/actual/promise/all";
// a dead effect-free tail (proxy-member chain or bare constructor) drops from the
// lifted SE prefix: the collection pre-pass marks it, the emission keys on that same mark
eff2();
const o3 = _Array$of;
export const r3 = o3(2);
eff4();
const all = _Promise$all;
export const r4 = all;
// export hosts and multi-declarator lists lift per declarator
effA();
export const keys = _Object$keys;
e1();
const f5 = _Array$from;
e2();
const entries = _Object$entries;
export const r5 = [f5, entries];