import _at from "@core-js/pure/actual/instance/at";
// `obj[k]` with `k: keyof T` reads a member VALUE. T's only member is a METHOD returning an array,
// so `obj[k]` is the method FUNCTION itself, not its return - the array-specific `.at` must NOT be
// dispatched onto a function value, so the resolver bails to the generic instance helper. a getter
// or data property (whose access yields a readable value) would keep the precise narrow.
function pick<T extends {
  m(): number[];
}>(obj: T, k: keyof T) {
  var _ref;
  return _at(_ref = obj[k]).call(_ref, 0);
}
export const r = pick({
  m: () => [1, 2]
}, 'm');