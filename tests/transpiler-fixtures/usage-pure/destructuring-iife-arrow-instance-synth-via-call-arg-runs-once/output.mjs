import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
export const viaCallArgRunsOnce = ((_ref, _unused = void 0) => {
  let findLast = _findLastMaybeArray(_ref);
  return findLast;
})(mk());