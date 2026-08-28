// a for-x HEAD destructure reads its statics off an ELEMENT of the iterated literal, and every
// element of a multi-element one is a receiver the pattern reaches. this flavor rewrites nothing, so
// it owes the union: each element is resolved on its own and every module any of them names is
// installed - an element holding a value of its own simply names none
for (const { Array: { from } } of [globalThis, self]) from([1]);

for (const { Object: { fromEntries } } of [globalThis, { Object: { fromEntries: null } }]) fromEntries([]);

// ... and a FLAT head over a MIXED literal is where the two flavors part on purpose: no single
// receiver answers for the loop, so usage-pure keeps a per-pass identity guard while this flavor,
// which rewrites nothing, injects for every element the literal names
for (const { of: viaMixed } of [Array, { of: null }]) viaMixed(1);
