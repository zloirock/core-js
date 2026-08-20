import _Array$from from "@core-js/pure/actual/array/from";
// for-loop init with a nested proxy destructure plus a sibling property: each must
// produce its own polyfill alias.
for (const from = _Array$from, i = 0; i < 1; i++) from([i]);