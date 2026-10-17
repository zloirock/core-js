import _Object$assign from "@core-js/pure/actual/object/assign";
// A patched enum key cannot select its original static during destructuring.
enum PatPatched {
  OF = 'of',
}
_Object$assign(PatPatched, {
  OF: 'from'
});
const {
  [PatPatched.OF]: fromPatchedKey
} = Array;
export const r12 = typeof fromPatchedKey;