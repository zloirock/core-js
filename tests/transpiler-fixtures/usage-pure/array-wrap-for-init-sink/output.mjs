import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// For-init array patterns keep their effects, stores and native static reads in the header.
// The independent prototype at leaf still dispatches on its original receiver.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let out1, out2, out3;
for (const [{
  Object: {
    defineProperty
  }
}] = [(eff('p'), _globalThis), 7]; !out1;) out1 = defineProperty;
for (const [{
  Object: {
    defineProperties
  }
}] = [kw = (eff('q'), _globalThis)]; !out2;) out2 = defineProperties;
for (const [{
  Object: {
    getOwnPropertyNames
  }
}] = [_globalThis, eff('s')]; !out3;) out3 = getOwnPropertyNames;
// A reading claim captures the stored wrapper element before dispatching, so the store
// and its effect run once in the loop header.
let out4;
for (const [_ref] = [kw = (eff('t'), _globalThis)], soleAt = _atMaybeArray(_ref.Array.prototype); !out4;) out4 = soleAt;
export { out1, out2, out3, out4, seen, kw };