import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// for-init SE-sink with a tail that still hides a nested effect below the top-level sequence
// peel: the sink keeps the whole tail text (lifting only the pure binding would drop the buried
// effect) and the buried proxy root is still substituted
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let out;
for (const from = _Array$from, _unused = (eff('outer'), [(eff('inner'), _globalThis)]); !out;) out = from;
export { out, seen };