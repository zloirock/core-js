// A closure can reassign the alias stored in a literal container.
// The native nested static read preserves the value captured by that container.
let closedAlias = globalThis;
function closeOver() {
  closedAlias = self;
}
const { w: { Array: { from: viaClosedAlias } } } = { w: closedAlias };

export default [viaClosedAlias, closeOver];
