import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
const from = _Array$from;
// a `...rest` sibling keeps the destructure init in the output (rest needs the source object), so
// the emitter re-substitutes the proxy globals inside that retained logical. when a `??` operand is
// a PARENTHESIZED `||` chain, its wrapping parens are REQUIRED (`??` cannot mix with `||` without
// them) - dropping them on substitution is a syntax error the AST-based twin never produces
const {
  from: _unused,
  ...rest
} = _globalThis.Array ?? (_Set || _Map);
const groupBy = _Map$groupBy;
const {
  groupBy: _unused2,
  ...others
} = _Map ?? (_WeakMap || _Set);
export { from, rest, groupBy, others };