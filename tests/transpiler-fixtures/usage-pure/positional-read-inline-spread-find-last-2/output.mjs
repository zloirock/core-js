import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
const [viaShiftedAlias] = [...wrapped, [1]];
(_findLastMaybeArray(viaShiftedAlias) || 0).call(viaShiftedAlias, Boolean);
export { viaShiftedAlias };