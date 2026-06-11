import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// dominance-aware alias walk: the const captures G.Array BEFORE the upstream reassignment,
// so the reassignment cannot reach the capture read and super.<static> still resolves (a
// flat constant-violations bail dropped the polyfill and threw on ie11)
let G = _globalThis;
const Base = G.Array;
G = null;
class C extends Base {
  static make() {
    return _Array$from.call(this, [1]);
  }
}
C.make();