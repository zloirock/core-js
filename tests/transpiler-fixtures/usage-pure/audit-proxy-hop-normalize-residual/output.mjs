import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a single-key proxy-hop destructure plans like its flat twin, so an unresolvable leaf
// re-anchors to the constructor binding instead of reading the native key off the proxy root
const {
  customY
} = _Map;
// a resolvable sibling extracts; the survivor still re-anchors
const tryFn = _Promise$try;
const {
  customZ
} = _Promise;
// boundary: a multi-key outer pattern keeps the proxy-root residual
const {
  Iterator: {
    customA
  },
  navigator: nav
} = _globalThis;
// boundary: an SE-prefixed init keeps the nested handling
const {
  Set: {
    customB
  }
} = (eff(), _globalThis);
// boundary: a proxy-global KEY keeps the nested handling (only a constructor key hops)
const {
  globalThis: {
    Map: {
      customG
    }
  }
} = _globalThis;
// an escaped string key resolves to its cooked constructor name
const {
  customU
} = _Iterator;
// a computed static-string key resolves like the literal spelling
const {
  customK
} = _WeakSet;
// boundary: a side-effecting computed key keeps the nested handling (effect must run once)
const {
  [(effK(), 'WeakMap')]: {
    customE
  }
} = _globalThis;
export const r = [customY, tryFn, customZ, customA, nav, customB, customG, customU, customK, customE];