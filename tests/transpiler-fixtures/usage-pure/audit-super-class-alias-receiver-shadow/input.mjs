// a super-class alias whose init reads a member off a receiver (`var Base = R.Promise`) or
// destructures it (`var { Promise: Base } = R`) resolves `R` in the alias's OWN declaration scope.
// an inner-function `var` redeclaring the receiver name shadows it only at the class site, so
// resolving there would bind the super-class to the inner shadow. both cases below carry such a
// shadow of the receiver name.

// the receiver is `userLibrary` at the declaration, so the inherited static stays native - folding
// `super.race` to a pure Promise helper would un-throw the native call on the user's Promise
var recvA = userLibrary;
var memberAlias = recvA.Promise;
function memberSuper() {
  var recvA = globalThis;
  return class extends memberAlias {
    static build() { return super.race([]); }
  };
}

// the receiver is the global at the declaration, so the destructured super-class DOES resolve and
// the inherited static folds - the inner shadow must not suppress it
var recvB = globalThis;
var { Promise: destructureAlias } = recvB;
function destructureSuper() {
  var recvB = userLibrary;
  return class extends destructureAlias {
    static build() { return super.allSettled([]); }
  };
}

export { memberSuper, destructureSuper };
