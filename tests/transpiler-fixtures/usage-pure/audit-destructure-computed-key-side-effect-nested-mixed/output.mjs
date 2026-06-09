import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested destructure mixing a STATIC key (`from` on Array) and an INSTANCE key (`flat` on `arr`) in
// sibling branches, each with its own effecting prefix. BOTH polyfill via the residual: the static key
// extracts `const f = _Array$from`, and the instance key resolves its receiver by walking the RHS along
// the nesting key (`y` -> `arr`, a bare Identifier safe to re-reference) and extracts `_flatMaybeArray(arr)`.
// the keys stay in place renamed, so both effects run in source order. a side-effect-free LITERAL receiver
// also polyfills (re-referencing yields a same-type value); a MEMBER (getter) / call receiver bails to
// native - re-referencing it beside the residual would re-fire the side effect
const arr = [1, [2]];
const f = _Array$from;
const m = _flatMaybeArray(arr);
const {
  x: {
    [(before(), 'from')]: _unused
  },
  y: {
    [(after(), 'flat')]: _unused2
  }
} = {
  x: Array,
  y: arr
};