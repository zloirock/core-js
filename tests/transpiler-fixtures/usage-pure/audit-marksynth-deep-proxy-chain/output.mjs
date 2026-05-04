import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// deep proxy-global chain `globalThis.window.self.Array` as receiver of a parameter
// destructure default. `markSynthReceiverSkipped` walks down each MemberExpression's
// `.object` and adds every link to skippedNodes; the final leaf Identifier `globalThis`
// is also skipped so the inner Identifier visitor does not race with synth-swap on the
// replaced receiver range. distinct sibling methods per param confirm key registration.
function f({
  from,
  of
} = {
  from: _Array$from,
  of: _Array$of
}) {
  return from([1, 2]) + of(3, 4);
}
function g({
  intersection,
  union
} = _Set.prototype) {
  return intersection.call(new _Set(), new _Set()) + union.call(new _Set(), new _Set());
}
export { f, g };