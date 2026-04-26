import _Array$from from "@core-js/pure/actual/array/from";
// for-loop init with a single nested proxy destructure (no siblings): the rewrite
// still threads through the nested proxy correctly.
for (const from = _Array$from; from([0]).length;) break;