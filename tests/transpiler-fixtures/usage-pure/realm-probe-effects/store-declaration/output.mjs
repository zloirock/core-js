import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// The saved realm and its unbacked hop survive consuming the whole pattern.
export function read() {
  let held;
  const resolve = ((held = _self).window.Promise, _Promise$resolve);
  return typeof resolve;
}