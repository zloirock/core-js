import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Error$isError from "@core-js/pure/actual/error/is-error";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class K {
  static get g() {
    log();
    return 0;
  }
}
function mkMap() {
  log();
  return _Map;
}
const z1 = 1;
K.g;
const a1 = _Array$from;
const {
  foo: b1
} = Array;
export const z2 = 1;
K.g;
export const a2 = _Array$of;
export const {
  foo: b2
} = Array;
for (const a3 = (K.g, _Object$fromEntries), {
    foo: b3
  } = Object;;) break;
K.g;
const a4 = _Iterator$from;
const nm4 = _nameMaybeFunction(_Iterator);
if (c) {
  K.g;
  var a5 = _Promise$try;
}
if (c) {
  var z6 = 1;
  K.g;
  var a6 = _Error$isError;
}
K.g, mkMap();
const a7 = _Map$groupBy;
const [{
  fromAsync: m8
}, z8] = [(K.g, Array), 1];
K.g;
const S9 = _Set;
const {
  foo: b9
} = _globalThis;
use(z1, a1, b1, a3, b3, a4, nm4, a5, z6, a6, a7, m8, z8, S9, b9);