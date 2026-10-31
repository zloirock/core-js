import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
for (const viaCommon of [...[[1], [2]]]) _findLastIndexMaybeArray(viaCommon).call(viaCommon, Boolean);