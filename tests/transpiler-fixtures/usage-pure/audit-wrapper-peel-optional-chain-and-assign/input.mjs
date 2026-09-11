// The runtime-object peel that precedes a global lookup must snip the same wrapper set at every site.
// An optional-chain-wrapped constructor and an assignment-expression runtime object both resolve to
// the real constructor, so an instance method on the result narrows to its array-specific helper
// (a paren-only / chain-blind peel left the result unresolved and emitted the generic dispatcher).
new (globalThis?.Array)().at(0);
let a;
(a = Array).from([1]).flat();
