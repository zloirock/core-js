import _Promise$all from "@core-js/pure/actual/promise/all";
// The name is in scope in a PARAM DEFAULT too, so a tag reference there is an extra caller as well.
export const selfRefInParamDefault = function P({
  ['all']: all
} = {
  ['all']: _Promise$all
}, cb = () => <P x={1} />) {
  return [all, cb];
}();