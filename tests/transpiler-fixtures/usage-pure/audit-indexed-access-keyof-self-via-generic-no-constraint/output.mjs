import _at from "@core-js/pure/actual/instance/at";
// T has no constraint - no member info available, fold bails, dispatch stays generic
function f<T>(t: T, k: keyof T) {
  var _ref;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _at(_ref = t[k]).call(_ref, 0);
}
f({
  a: 'x'
}, 'a');