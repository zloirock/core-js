import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a trailing object spread can REDEFINE a matched namespace key at runtime with statically-unknown
// contents, so super-static resolution through that key must BAIL. `A` spreads AFTER `Promise: Promise`
// (the spread may shadow it) -> super.try must stay native; `B` spreads BEFORE the key (the explicit
// key wins) -> super.try resolves to the polyfill. the reverse member scan must distinguish at/after
// the matched key (shadows) from before it (irrelevant). without the bail, `A` would wrongly rewrite
// super.try to core-js Promise.try, invoking it instead of whatever the spread redefined Promise to.
// `C` has a spread BOTH before AND after the key: the trailing spread still shadows, so it bails too
const afterNS = {
  Promise: _Promise,
  ...someLib
};
class A extends afterNS.Promise {
  static foo() {
    return super.try(() => 1);
  }
}
const beforeNS = {
  ...someLib,
  Promise: _Promise
};
class B extends beforeNS.Promise {
  static bar() {
    return _Promise$try.call(this, () => 2);
  }
}
const bothNS = {
  ...someLib,
  Promise: _Promise,
  ...otherLib
};
class C extends bothNS.Promise {
  static baz() {
    return super.try(() => 3);
  }
}
A.foo();
B.bar();
C.baz();