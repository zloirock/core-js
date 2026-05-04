// deep proxy-global chain `globalThis.window.self.Array` as receiver of a parameter
// destructure default. `markSynthReceiverSkipped` walks down each MemberExpression's
// `.object` and adds every link to skippedNodes; the final leaf Identifier `globalThis`
// is also skipped so the inner Identifier visitor does not race with synth-swap on the
// replaced receiver range. distinct sibling methods per param confirm key registration.
function f({ from, of } = globalThis.window.self.Array) {
  return from([1, 2]) + of(3, 4);
}
function g({ intersection, union } = globalThis.self.Set.prototype) {
  return intersection.call(new Set(), new Set()) + union.call(new Set(), new Set());
}
export { f, g };
