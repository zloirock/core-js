import _globalThis from "@core-js/pure/actual/global-this";
const withRecursion = function r({
  groupBy,
  ...rest
} = Object) {
  return _globalThis.never ? r({
    groupBy: null
  }) : [groupBy, rest];
}();
export { withRecursion };