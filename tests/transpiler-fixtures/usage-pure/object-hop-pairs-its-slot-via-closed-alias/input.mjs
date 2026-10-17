// a binding reassigned to a realm name from INSIDE a nested function: the write is reachable and
// every reachable value names the realm, so the hop reads it as the flat form does - a static
// claims, an instance key stays native (the realm object carries no `at`)
let closedAlias = globalThis;
function closeOver() {
  closedAlias = self;
}
const { w: { Array: { from: viaClosedAlias } } } = { w: closedAlias };

export default [viaClosedAlias, closeOver];
