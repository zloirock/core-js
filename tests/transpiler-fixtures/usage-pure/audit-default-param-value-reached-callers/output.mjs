import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// the default's TYPE describes the param only where no caller overrides that slot, and the scan for those
// callers runs over the NAMES binding the function. a function EXPRESSION standing in an expression position
// has no such name: its own one binds inside it, so an empty reference set for it says it never recurses,
// while the callers arrive through the VALUE. each row below hands the function straight to an invoker - a
// tagged template, a `.call` hop, an argument slot, a property it is stored in - any of which may pass a
// foreign value, so the param stays generic. the declaration at the end is the contrast: its name is the
// only way in, nothing calls it with an argument, and the array-specific narrow holds
const tagged = function tag(x = [1, 2]) {
  return _at(x).call(x, 0);
}`str`;
const hopped = function hop(x = [1, 2]) {
  return _at(x).call(x, 0);
}.call(null, "hello");
const passed = (fn => fn("hello"))(function given(x = [1, 2]) {
  return _at(x).call(x, 0);
});
const held = {
  run: function stored(x = [1, 2]) {
    return _at(x).call(x, 0);
  }
}.run("hello");
function named(y = [1, 2]) {
  return _includesMaybeArray(y).call(y, 1);
}
const pinned = named();
export default [held, hopped, passed, pinned, tagged];