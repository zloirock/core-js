import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `t[k]` where T's value-union is all string - dispatch narrows to `_atMaybeString`
function f<T extends {
  a: string;
  b: string;
}>(t: T, k: keyof T) {
  var _ref;
  return _atMaybeString(_ref = t[k]).call(_ref, 0);
}
f({
  a: 'x',
  b: 'y'
}, 'a');