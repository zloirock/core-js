import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
// literal-arg annotation bridge boundaries: only trivially-typed literals bridge (objects
// and functions stay opaque - generic); a template with expressions is still a string and
// OVERRIDES a mismatched default; an explicit type-arg wins over the bridge; an array
// literal bridges container precision with an inert element slot
type Wrap<T> = {
  v: T;
};
declare const n: number;
function w<T = number[]>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
_at(_ref = w({
  a: 1
}).v).call(_ref, 0);
_includes(_ref2 = w(() => 1).v).call(_ref2, 1);
_atMaybeString(_ref3 = w(`a${n}b`).v).call(_ref3, 0);
_includesMaybeString(_ref4 = w<string>('abc' as any).v).call(_ref4, 'c');
function ws<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
_atMaybeArray(_ref5 = ws([new Date()]).v).call(_ref5, 0);