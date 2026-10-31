import _Promise$race from "@core-js/pure/actual/promise/race";
// NEGATIVE: an intrinsic-spelled tag in a param default references nothing.
export const intrinsicInParamDefault = function span({
  ['race']: race
} = {
  ['race']: _Promise$race
}, cb = () => <span x={1} />) {
  return [race, cb];
}();