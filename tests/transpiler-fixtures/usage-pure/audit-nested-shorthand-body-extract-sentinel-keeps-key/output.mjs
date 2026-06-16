import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A consumed SHORTHAND binding inside a nested destructure is body-extracted to a const, so its
// destructure slot must be neutralized to a sentinel that KEEPS the original key (`{ at: _unused }`),
// NOT a shorthand `{ _unused }` - the shorthand reads the wrong property (`m._unused`) and skips the
// original `m.at` read (getter side effects / rest exclusion). a side-effecting computed-key sibling
// keeps its own key intact (only its value is renamed to a throwaway).
// the inner receiver (`m`'s value) is re-emitted into the `_atMaybeArray(...)` body-extract: this
// only happens for a RE-REFERENCEABLE receiver, so it is restricted to a pure literal here - a
// side-effecting (`m: f()`) or member/getter (`= obj`, receiver `obj.m`) receiver makes the body-
// extract bail entirely (no duplication, no double evaluation). re-emitting a pure literal is exactly
// what babel does, so this stays parity; memoizing it into a `_ref` would instead DIVERGE from babel
function key() {
  return 'k';
}
const at = _atMaybeArray([1]);
const {
  m: {
    at: _unused
  },
  [key()]: picked
} = {
  m: [1],
  k: 2
};
at();
export const out = picked;