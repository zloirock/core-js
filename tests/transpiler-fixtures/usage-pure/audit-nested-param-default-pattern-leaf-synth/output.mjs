import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// a pattern-valued leaf (`of: { name }`) DESCENDS in the mirrored default: the slot spells the
// pattern's own keys off the static's ponyfill, so a leaf carrying a claim of its own is dispatched
// there (`of: { name: _nameMaybeFunction(_Array$of) }`) instead of being read natively off the
// polyfill value - the claim is a real one on engines with no `Function.prototype.name`
function f({
  Array: {
    from,
    of: {
      name
    }
  }
} = {
  Array: {
    from: _Array$from,
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
}) {
  return [from, name];
}
f();