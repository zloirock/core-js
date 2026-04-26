import _Array$from from "@core-js/pure/actual/array/from";
// rewrite where the replacement text itself contains the original needle: must not
// trigger a re-pass through the just-emitted text.
_Array$from(_Array$from(arr));