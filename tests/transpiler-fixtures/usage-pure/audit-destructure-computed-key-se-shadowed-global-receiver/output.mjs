import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// the receiver references a SHADOWED name (a param), not the global - the copied-receiver substitution
// must NOT rewrite it to the pure binding (it is the local Promise, not the global)
function f(Promise) {
  const _ref = [1, Promise],
    m = null == _ref ? _ref[""] : (eff(), _flatMaybeArray(_ref));
  return m;
}