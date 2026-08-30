import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// the buried proxy-global root of an inline-provable call carries a SIDE-EFFECT-BEARING ARGUMENT.
// the effect has to be re-emitted somewhere, and whoever re-emits it must not take the hop's
// static claim with it: the `.of` below is the global's, not the argument's, so dropping the claim
// leaves a raw read off the memo (undefined on ie:11) and loses the import outright. one static and
// one instance method per line, so a row that stops resolving shows up in the import set as well.
let seCount = 0;
export const seArgStatic = null == (x => _globalThis)(_Array$from([1]))?.window ? void 0 : _atMaybeArray(_ref = _Array$of(5)).call(_ref, 0);
export const seArgInstance = null == (x => _globalThis)(_flatMaybeArray(_ref2 = [1, [2]]).call(_ref2))?.window ? void 0 : _includesMaybeArray(_ref3 = _Object$values({
  b: 2
})).call(_ref3, 2);
export const seArgSequence = null == (x => _globalThis)((seCount++, _padStartMaybeString(_ref4 = 'ab').call(_ref4, 3, '-')))?.window ? void 0 : _endsWithMaybeString(_ref5 = _String$fromCodePoint(99, 100)).call(_ref5, 'd');

// the effect sits on BOTH sides of the call - the callee body and the argument - so the order the
// two are re-emitted in is observable, and the claim still has to survive both
export const seBodyAndArg = null == (x => {
  seCount++;
  return _globalThis;
})(_Object$entries({
  a: 1
}))?.window ? void 0 : _flatMapMaybeArray(_ref6 = _Reflect$ownKeys({
  c: 3
})).call(_ref6, key => [key]);

// the same root without a live optional over the hop: the receiver is swallowed rather than kept
// in a test, so the effect travels a different path to the output
export const seArgPlainHop = ((x => _globalThis)(_Number$parseFloat('1.5')), _Set).prototype.has.call(new _Set([1]), 1);

// BASELINE: an effectless argument - nothing to re-emit, and the claim is never at risk
export const noSeArg = null == (x => _globalThis)(1).window ? void 0 : _Promise$resolve(4).finally(() => {});