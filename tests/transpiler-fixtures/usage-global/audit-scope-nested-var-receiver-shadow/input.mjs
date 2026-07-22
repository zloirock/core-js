// a receiver alias's init resolves that receiver in the alias's OWN declaration scope. the use-site
// walk can descend into a nested function, and estree hoists that function's `var` of the receiver
// name to its own scope - invisible from the module-level alias. resolving there would bind the
// alias's receiver to the inner shadow (aligns the estree var-hoist walk with babel, which scopes
// the inner var natively). both cases below carry such a shadow of the receiver name.

// the receiver is `userLibrary` at the declaration, so it is provably not the global, injects nothing
var recvA = userLibrary;
var mapAlias = recvA.Map;
function shadowed() {
  var recvA = globalThis;
  return mapAlias.groupBy([], key => key);
}

// the receiver is the global at the declaration, so the destructured static's polyfill IS injected -
// the inner shadow must not suppress it (a missed injection in the other direction)
var recvB = globalThis;
var { Array: arrayAlias } = recvB;
function resolved() {
  var recvB = userLibrary;
  return arrayAlias.fromAsync([]);
}

export { shadowed, resolved };
