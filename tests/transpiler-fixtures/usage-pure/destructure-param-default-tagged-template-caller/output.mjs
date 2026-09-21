import _Array$of from "@core-js/pure/actual/array/of";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const tagged = function tag({
  from,
  ...rest
} = Array) {
  return [from, rest];
}`x`;
const anonymous = function ({
  from,
  ...rest
} = Array) {
  return [from, rest];
}`y`;
const invoked = function keep({
  of: _unused,
  ...others
} = Array) {
  let of = _Array$of;
  return [of, others];
}();
export default [anonymous, invoked, tagged];