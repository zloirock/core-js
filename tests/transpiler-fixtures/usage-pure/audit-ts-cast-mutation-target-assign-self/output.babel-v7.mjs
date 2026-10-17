import _Object$assign from "@core-js/pure/actual/object/assign";
// ... and the patched twin declines, exactly as it does on a member key
enum HopPatched {
  SELF = 'self',
}
_Object$assign(HopPatched, {
  SELF: 'window'
});