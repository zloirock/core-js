import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a CALL through a `keyof` key reads what each value returns, not the value: the fold answers the
// value's type, so the call stays generic - never the value's own family, which took the polyfill away
export function firstOf<T extends Record<string, () => number[]>>(table: T, key: keyof T) {
  var _ref;
  return _at(_ref = table[key]()).call(_ref, 0);
}
const makers = {
  one: () => [1],
  two: () => [2]
};
export function hasOne(key: keyof typeof makers) {
  var _ref2;
  return _includes(_ref2 = makers[key]()).call(_ref2, 1);
}