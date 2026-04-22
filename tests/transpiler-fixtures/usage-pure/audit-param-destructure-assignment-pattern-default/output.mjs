import _Array$from from "@core-js/pure/actual/array/from";
// `function({ from = [] } = Array)` - user's `[]` default on the inner destructure
// prop is dead code when synth-swap replaces `Array` with `{from: _Array$from, ...}`
// (polyfill id is always defined). without AssignmentPattern support on prop.value,
// the whole destructure would bail and native `Array.from` would be used
function firstItem({
  from = []
} = {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
export { firstItem };