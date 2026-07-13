import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init SE-sink with an effect at BOTH wrapper levels (a top-level prefix and one buried in
// the array element): the canonical descent flattens both into the sink sequence in source
// order - the discarded wrapper drops, the effects and the substituted proxy root survive
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let out;
for (const from = _Array$from, _unused = (eff('outer'), eff('inner'), _globalThis); !out;) out = from;
export { out, seen };