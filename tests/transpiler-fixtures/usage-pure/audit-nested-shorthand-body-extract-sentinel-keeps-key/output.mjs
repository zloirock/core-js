import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A consumed SHORTHAND binding inside a nested destructure is body-extracted to a const, so its
// destructure slot must be neutralized to a sentinel that KEEPS the original key (`{ at: _unused }`),
// NOT a shorthand `{ _unused }` - the shorthand reads the wrong property (`m._unused`) and skips the
// original `m.at` read (getter side effects / rest exclusion). a side-effecting computed-key sibling
// keeps its own key intact (only its value is renamed to a throwaway).
// the residual SURVIVES (the `[key()]` sibling binds `picked`), so the constant-literal receiver
// (`m`'s value) is memoized into a single `_ref` shared by the `_atMaybeArray(_ref)` extract and the
// residual - re-emitting it would duplicate the literal. a side-effecting (`m: f()`) or member/getter
// receiver makes the body-extract bail entirely. both emitters memoize identically, so it stays parity
function key() {
  return 'k';
}
const _ref = [1];
const at = _atMaybeArray(_ref);
const {
  m: {
    at: _unused
  },
  [key()]: picked
} = {
  m: _ref,
  k: 2
};
at();
export const out = picked;