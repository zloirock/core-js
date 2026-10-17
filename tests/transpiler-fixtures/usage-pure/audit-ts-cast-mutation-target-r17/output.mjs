import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
// A patched enum no longer names a pristine realm hop.
enum HopPatched {
  SELF = 'self'
}
_Object$assign(HopPatched, {
  SELF: 'window'
});
export const r17 = _globalThis[HopPatched.SELF].Array.from([4]);