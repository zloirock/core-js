import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// Proxy hops preserve the host's result; parameter defaults still read caller arguments.
// An assignment yields the realm while its nested target reads the ponyfill.
let customV;
// @ts-expect-error a static the constructor lacks is the read under test
const v = ({
  customV
} = _Map, _globalThis);
// a chained assignment uses the inner value too
let customC, c;
// @ts-expect-error a static the constructor lacks is the read under test
c = ({
  customC
} = _Promise, _globalThis);
// a param default destructures the CALLER argument when one is provided - never normalized
// @ts-expect-error a static the constructor lacks is the read under test
function f({
  Iterator: {
    customP
  }
} = _globalThis) {
  return customP;
}
export const fr = f();
// a TS cast peels to the receiver like the flat form - normalizes
const {
  customT
} = _Set;
// a discarded sequence-tail assignment is a statement context - normalizes
let customS;
// @ts-expect-error a static the constructor lacks is the read under test
eff();
({
  customS
} = _WeakMap);
// A for-init assignment keeps its expression in the loop header.
let customF;
// @ts-expect-error a static the constructor lacks is the read under test
for ({
  customF
} = _WeakSet, _globalThis; cond();) use(customF);
// A concise arrow body returns the original assignment value.
let customA;
// @ts-expect-error a static the constructor lacks is the read under test
const g = () => ({
  customA
} = _Symbol, _globalThis);
use(v, c, customT, customS, g);