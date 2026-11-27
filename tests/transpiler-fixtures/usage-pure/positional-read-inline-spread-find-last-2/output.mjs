import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
const [viaShiftedAlias] = [...wrapped, [1]];
(_findLastMaybeArray(viaShiftedAlias) || 0).call(viaShiftedAlias, Boolean);
_at(viaShiftedAlias).call(viaShiftedAlias, 0);
export { viaShiftedAlias };