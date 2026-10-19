import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _ref2, _unused, _unused2;
// A binding a TS assertion wraps whole is written as spelled, like its member twin, in both emitters - alone,
// beside a sibling, beside a rest, one level down, beside a nested rest, in a for-of head, over a default and
// as an instance claim's target, and under a level whose assignment yields its value.
let a: any, b: any, c: any, d: any, e: any, f: any, g: any, h: any, j: any, k: any, m: any, x: any, rest: any;
declare const arr: any[];
(a as any) = _Math$trunc;
// @ts-expect-error a static the constructor lacks is the read under test
b! = _Array$of;
({
  custom: c
} = Array);
(d satisfies any) = _Array$fromAsync, {
  fromAsync: _unused,
  ...rest
} = Array;
({
  Object: {
    values: e as any
  }
} = {
  Object: {
    values: _Object$values
  }
});
({
  Object: _ref
} = _globalThis), f! = _Object$entries, {
  entries: _unused2,
  ...rest
} = _ref;
for ({
  fromEntries: g as any
} of [{
  fromEntries: _Object$fromEntries
}]);
(h as any) = _Object$groupBy;
// @ts-expect-error a pattern reading a member its source lacks is the shape under test
({} = arr), (j as any) = _atMaybeArray(arr), {
  custom: c
} = arr;
x = ({} = arr, (k as any) = _includesMaybeArray(arr), arr);
x = (_ref2 = {
  Object: {}
} = _globalThis, (m as any) = _Object$hasOwn, _ref2);