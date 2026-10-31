// a spread AFTER a matched namespace key can REDEFINE it at runtime with statically-unknown
// contents, so super-static resolution through that key must BAIL and stay native. `A` spreads
// after `Promise: Promise` -> super.try stays native; `B` spreads before the key (explicit key
// wins) -> super.try resolves to the polyfill; `C` spreads both before AND after -> the trailing
// spread still shadows, so it bails. only spreads at/after the matched key matter; earlier ones don't.
const afterNS = { Promise: Promise, ...someLib };
class A extends afterNS.Promise {
  static foo() { return super.try(() => 1); }
}
const beforeNS = { ...someLib, Promise: Promise };
class B extends beforeNS.Promise {
  static bar() { return super.try(() => 2); }
}
const bothNS = { ...someLib, Promise: Promise, ...otherLib };
class C extends bothNS.Promise {
  static baz() { return super.try(() => 3); }
}
A.foo();
B.bar();
C.baz();
