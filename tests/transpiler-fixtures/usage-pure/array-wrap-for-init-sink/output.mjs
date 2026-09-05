import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// the FOR-INIT sink: a value-dead pure extra sheds with the brackets, a kept write rides the
// sole extraction ahead of the pure it binds - one declarator in the header either way - and an
// EFFECTFUL neighbour keeps the wrapper native in the header, where the loop cannot host a lift
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let out1, out2, out3;
for (const defineProperty = _Object$defineProperty, _unused = (eff('p'), _globalThis); !out1;) out1 = defineProperty;
for (const defineProperties = (kw = (eff('q'), _globalThis), _Object$defineProperties); !out2;) out2 = defineProperties;
for (const [{
  Object: {
    getOwnPropertyNames
  }
}] = [{
  Object: {
    getOwnPropertyNames: _Object$getOwnPropertyNames
  }
}, eff('s')]; !out3;) out3 = getOwnPropertyNames;
// a READING claim over a STORED element dispatches on what the write stored, riding the write
// inside its dispatch
let out4;
for (const soleAt = _atMaybeArray((kw = (eff('t'), _globalThis), _globalThis.Array.prototype)); !out4;) out4 = soleAt;
export { out1, out2, out3, out4, seen, kw };