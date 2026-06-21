import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// predicate positional binding: the predicate's narrowed param is `x` (second param).
// Caller passes `target` in slot 1. resolution must find the slot where the param name
// is `x` (slot 1) and verify the slot-1 argument is the var. If it always used slot 0,
// narrowing would attach to `opts` (wrong identifier) and `target.at` would not resolve
// via the array guard.
function isArr(opts: {
  strict: boolean;
}, x: unknown): x is number[] {
  return Array.isArray(x) && (opts.strict ? x.length > 0 : true);
}
function check(target: unknown) {
  if (isArr({
    strict: true
  }, target)) {
    _atMaybeArray(target).call(target, 0);
  }
}
check([1, 2]);