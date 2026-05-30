// Same destructured-global superclass shape as the sibling fixture, but the instance
// method is `at` - confirms the inheritance narrow reaches a different Array polyfill.
const { Array } = globalThis;
class X extends Array {}
new X().at(0);
