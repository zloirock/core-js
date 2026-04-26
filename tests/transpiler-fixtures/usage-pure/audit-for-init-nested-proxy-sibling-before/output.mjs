import _Array$from from "@core-js/pure/actual/array/from";
// for-loop init where a nested proxy destructure is preceded by a sibling property:
// the rewrite must keep both sites independent.
for (let i = 0, from = _Array$from; i < 1; i++) from([i]);