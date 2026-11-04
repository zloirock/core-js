import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
export const viaCallArgRunsOnce = (_ref => {
  let findLast = _findLastMaybeArray(_ref);
  return findLast;
})(mk());