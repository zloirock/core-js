import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a sequence AROUND the kept assignment (`((se(), t = nav)).Map`) - not inside its value - must
// not hide the chain-assign from the claim machinery: the claim still fires through the kept
// assignment, the value spells by the shared canon (leaf ponyfill / collapsed tail), and the
// prefix effect keeps its own polyfill and runs exactly once, ahead of the assignment. the
// emitters differ only in the memo shape around the claim (an AST memoize vs a direct argument)
const arr = [1];
let t;
export const seqAroundGuard = (_ref = (_atMaybeArray(arr).call(arr, 0), t = _self, _Map), _nameMaybeFunction(_ref));
export const seqAroundStatic = (_atMaybeArray(arr).call(arr, 0), t = _self, _Number$MAX_SAFE_INTEGER);
export const seqAroundTail = (_ref2 = (_atMaybeArray(arr).call(arr, 0), t = _self, _Map), _nameMaybeFunction(_ref2));
// the same tail value under a LIVE guard: the test spells the collapsed value, never a raw hop
export const seqAroundGuardTail = null == (_atMaybeArray(arr).call(arr, 0), t = _self) ? void 0 : _nameMaybeFunction(_Map);
// a chain-END ctor read under the guard: the erase verdict must not flip on the wrapper - the
// wrapped twin holds the same undefinable value as the bare spelling, so both keep the guard
export const seqAroundGuardCtor = null == (_atMaybeArray(arr).call(arr, 0), t = _self) ? void 0 : _Map;
export const bareGuardCtor = null == (t = _self) ? void 0 : _Map;

// an ALIAS root digs the same way (its binding rewrites itself, the value canon keeps the
// alias name), and a for-init receiver crosses the discard channel that keeps effect-free
// receiver tails alive
const galias = _globalThis;
export const aliasSeqAround = (_atMaybeArray(arr).call(arr, 0), t = _self, _Number$MAX_SAFE_INTEGER);
export const forInit = (() => {
  const out = [];
  for (const x of (_atMaybeArray(arr).call(arr, 0), t = _self, _Array$of)(7)) _pushMaybeArray(out).call(out, x);
  return out;
})();