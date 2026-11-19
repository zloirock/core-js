import _Array$from from "@core-js/pure/actual/array/from";
// UTF-8 BOM + composed nested polyfill: BOM is stripped, and the outer polyfill wraps
// the inner polyfill in a single rewrite without byte offsets drifting
_Array$from(_Array$from(x));