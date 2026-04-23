import _Array$from from "@core-js/pure/actual/array/from";
// `isPluginShapedOrphanAssign` filters out user `_ref = literal` sloppy-mode assignments
// so they aren't adopted as pipeline leftovers by the post-pass orphan heuristic.
// our emitted `_ref = foo()` always has a complex RHS
_ref = 42;
_Array$from(x);