import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Both the outer sequence and inner array-element effects stay in the for-init header.
// The wrapper and its static from read remain native.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let out;
for (const [{
  Array: {
    from
  }
}] = (eff('outer'), [(eff('inner'), _globalThis)]); !out;) out = from;
export { out, seen };