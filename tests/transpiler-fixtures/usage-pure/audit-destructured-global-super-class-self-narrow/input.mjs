// Same destructured-global superclass shape, but the proxy-global root is `self` instead of
// `globalThis` - confirms the in-place-rewrite recovery is not specific to one root. `at` must
// narrow through the inheritance to the array instance polyfill.
const { Array } = self;
class X extends Array {}
new X().at(0);
