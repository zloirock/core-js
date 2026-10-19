import _at from "@core-js/pure/actual/instance/at";
// `t[k]` where `k: keyof T` over a constraint whose named members are all strings: a subtype
// may still add a key of another family, so the read stays generic rather than string-narrow
function f<T extends {
  a: string;
  b: string;
}>(t: T, k: keyof T) {
  var _ref;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _at(_ref = t[k]).call(_ref, 0);
}
f({
  a: 'x',
  b: 'y'
}, 'a');