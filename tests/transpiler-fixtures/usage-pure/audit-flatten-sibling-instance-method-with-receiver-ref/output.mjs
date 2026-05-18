import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// flatten on decl[0] + sibling decl[1] arrow with BOTH a `globalThis` receiver-ref AND an
// instance-method call (`.values()`). instance-method emit body-wraps the arrow expr body
// into `{ var _ref; return _valuesMaybeArray(_ref = [...]).call(_ref); }`. body-wrap
// captures its needle from ORIGINAL source. `polyfillSiblingReceiverRefs` queues the
// `globalThis -> _globalThis` substitution on transform-queue (not as a preservedSrc
// splice anymore) so compose nests substitution INTO the body-wrap content via needle
// match. previously the splice path mutated preservedSrc to `_globalThis` BEFORE body-wrap
// composed - body-wrap's needle (original `[globalThis].values()`) no longer matched the
// mutated preservedSrc, dropping the wrap composition and leaking a trailing `)` from the
// unreplaced `.values()` call expression
const from = _Array$from;
const val = () => {
  var _ref;
  return _valuesMaybeArray(_ref = [_globalThis]).call(_ref);
};
console.log(from, val());