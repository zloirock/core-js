import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a structural narrow (default-param / rest-param / destructure slot / for-of element)
// reflects the initial value only: a CONDITIONAL reassign the straight-line walk cannot
// dominate may hold a foreign family at runtime, so each form bails to generic
export function viaDefaultParam(x = [1, 2, 3], c) {
  if (c) x = 'hello';
  return _at(x).call(x, 0);
}
export function viaRestParam(c, ...xs) {
  if (c) xs = 'hello';
  return _includes(xs).call(xs, 1);
}
export function viaDestructure(c) {
  let {
    a
  } = {
    a: [1, 2]
  };
  if (c) a = 'hello';
  return _at(a).call(a, 0);
}
export function viaForOf(c, items) {
  for (let x of items) {
    if (c) x = 'hello';
    return _includes(x).call(x, 2);
  }
}

// the write-free default still narrows precisely (local fn - every call site visible
// and omits the arg, so the default's type is the runtime value)
function cleanDefault(x = [1, 2, 3]) {
  return _atMaybeArray(x).call(x, 0);
}
export const viaCleanDefault = cleanDefault();