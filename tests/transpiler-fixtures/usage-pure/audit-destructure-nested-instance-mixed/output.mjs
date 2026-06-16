import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// nested STATIC (`from` on Array) + nested INSTANCE (`flat` on `arr`) in sibling branches, no side-effect
// keys. both polyfill: `const f = _Array$from` and `const m = _flatMaybeArray(arr)`. the declaration binds
// TWO names, so the residual is NOT dead - it is kept (elimination needs a sole binding): the static branch
// drops its own key, the instance branch keeps its key renamed to a throwaway. the binding count is taken
// from the ORIGINAL pattern (before the static branch removes its prop), so the keep-vs-drop decision is
// identical across both emitters - the one that mutates the AST and the one that rewrites text
const arr = [1, [2]];
const f = _Array$from;
const m = _flatMaybeArray(arr);
const {
  y: {
    flat: _unused
  }
} = {
  x: Array,
  y: arr
};