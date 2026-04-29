import _Array$from from "@core-js/pure/actual/array/from";
// four nested `Array.from(...)` calls; each must get its own polyfill
// substitution without overlap, even though they share the same callee.
_Array$from(_Array$from(_Array$from(_Array$from(s))));