import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
for (const viaCommon of [...[[1], [2]]]) {
  (_findLastIndexMaybeArray(viaCommon) || 0).call(viaCommon, Boolean);
  _atMaybeArray(viaCommon).call(viaCommon, 0);
}