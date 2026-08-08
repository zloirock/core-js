import _Array$from from "@core-js/pure/actual/array/from";
// IIFE param destructure mixes one polyfillable static method (`from`) with a user-defined
// member (`myExtension`). emitted call-site object literal supplies the polyfill binding
// for `from` and falls back to the original `Array` global for `myExtension`
const r = (({
  from,
  myExtension
}) => [from, myExtension])({
  from: _Array$from,
  myExtension: Array.myExtension
});
export { r };