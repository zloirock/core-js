import _Promise from "@core-js/pure/actual/promise";
export const selfRefInParamDefault = function P({
  all,
  ...rest
} = _Promise, cb = () => <P x={1} />) {
  return [all, rest, cb];
}();