// a for-x HEAD holds no init: what it destructures is an ELEMENT of the iterated literal, so the
// receiver mirror swaps the polyfill into the element itself. a multi-element literal binds a
// different element per pass, and each is mirrored where it is written - a single binding lifted
// out of the head could only answer while the head runs once. a non-proxy element declines the
// whole head: its value is not the global's, and the pattern must keep reading it natively
for (const { Array: { from }, JSON: J } of [globalThis, self]) from([J]);

for (const { Array: { of } } of [globalThis, { Array: { of: null } }]) of(1);

// a FLAT pattern reads its statics off the element too, and the literal carries a defaulted key
// like any other: the polyfill always wins, so the default's arm is the one that never runs
for (const { fromEntries, getOwnPropertyNames: viaDefault = 0 } of [Object]) fromEntries([[viaDefault]]);

// an ARRAY WRAPPER between the head and the pattern pairs a slot and hosts nothing, so the mirror
// answers inside the paired element exactly as it does without one
for (const [{ from }] of [[Array]]) from([]);

// ... and a SIDE-EFFECTING computed key stays in the pattern, where the source runs it exactly once,
// while the literal carries the key it folds to. the route that lifts such an effect into a
// statement of its own has no home on a head, which hosts none
for (const { [(eff(), 'from')]: viaSeKey } of [Array]) viaSeKey([]);

// ... and the wrappers change nothing about that: an array slot or a hop key between the head and
// the pattern pairs a value and hosts nothing, so the same route answers under both
for (const [{ [(eff(), 'of')]: viaWrappedSeKey }] of [[Array]]) viaWrappedSeKey(1);

for (const { Array: { [(eff(), 'fromAsync')]: viaNestedSeKey } } of [globalThis]) viaNestedSeKey([]);
