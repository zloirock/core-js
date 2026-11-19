import _at from "@core-js/pure/actual/instance/at";
// a structural narrow (default-param / rest-param / destructure slot / for-of element)
// reflects the initial value only: a CONDITIONAL reassign the straight-line walk cannot
// dominate may hold a foreign family at runtime, so each form bails to generic
export function viaDefaultParam(x = [1, 2, 3], c) {
  if (c) x = 'hello';
  return _at(x).call(x, 0);
}