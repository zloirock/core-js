import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _self from "@core-js/pure/actual/self";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
var _ref3;
// A nested static read through a realm behind an `&&` guard keeps that read once, as written: a falsy
// guard reaches the hop read, which throws where native throws, and a write the selection stores keeps
// the realm's own value. The capture holds the hop and coerces it, and the static extracts behind it - in
// a declaration, beside a rest or a sibling, and in an assignment whose value is discarded or read.
let w, stored, allSettled, sibling;
const o = {};
const {
  Object: {}
} = w = m && _globalThis;
const hasOwn = _Object$hasOwn;
const {
  Number: {}
} = stored = flag && _globalThis;
const isInteger = _Number$isInteger;
export { isInteger };
const {
    Array: _ref
  } = guard && _globalThis,
  {} = _ref,
  from = _Array$from,
  {
    from: _unused,
    ...arrays
  } = _ref;
const _ref2 = w = m && _self,
  {
    Math: {}
  } = _ref2,
  trunc = _Math$trunc,
  {
    x
  } = _ref2;
({
  String: {}
} = w = m && _globalThis), o.chars = _String$fromCodePoint;
export const used = (_ref3 = m && _globalThis, {
  allSettled
} = _ref3 === _globalThis ? {
  allSettled: _Promise$allSettled
} : _ref3.Promise, {
  y: sibling
} = _ref3, _ref3);
export { hasOwn, from, arrays, trunc, x, o, allSettled, sibling, w, stored };