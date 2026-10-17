import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Destructuring through a patched enum hop keeps the live receiver.
enum HopPatched {
  SELF = 'self',
}
_Object$assign(HopPatched, {
  SELF: 'window'
});
const {
  from: fromPatchedHop
} = _globalThis[HopPatched.SELF].Array;
export const r20 = typeof fromPatchedHop;