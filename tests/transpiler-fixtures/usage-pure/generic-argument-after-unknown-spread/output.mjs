import _at from "@core-js/pure/actual/instance/at";
function box<T>(a: T, b: {
  v: T;
} = {
  v: a
}, ...tail: unknown[]): {
  v: T;
} {
  return b;
}
export function read(xs: any[]) {
  var _ref;
  return _at(_ref = box('ab', ...xs, {
    v: 'cd'
  }).v).call(_ref, 0);
}