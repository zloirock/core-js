import _at from "@core-js/pure/actual/instance/at";
// `t[k]` where `k: keyof T` reads a key of whatever T the caller passed, and a subtype may add
// keys of another family to the ones its constraint names - so the read stays generic, as tsc
// leaves it; a constraint with a `string` index signature bounds every key and still narrows
function f<T extends {
  a: string[];
  b: string[];
}>(t: T, k: keyof T) {
  var _ref;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return _at(_ref = t[k]).call(_ref, 0);
}
f({
  a: ['x'],
  b: ['y']
}, 'a');