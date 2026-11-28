import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// A forwarded field keeps the actual argument family when its structural type is ambiguous.
type Wrap<T> = {
  v: T;
};
declare const n: number;
function w<T = number[]>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
w({
  a: 1
}).v.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
w(() => 1).v.includes(1);
_atMaybeString(_ref = w(`a${n}b`).v).call(_ref, 0);
_includesMaybeString(_ref2 = w<string>('abc' as any).v).call(_ref2, 'c');
function ws<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
_atMaybeArray(_ref3 = ws([new Date()]).v).call(_ref3, 0);