import _Promise from "@core-js/pure/actual/promise";
export const intrinsicInParamDefault = function span({
  race,
  ...rest
} = _Promise, cb = () => <span x={1} />) {
  return [race, rest, cb];
}();