// Global also needs Array.from for loop syntax; the separate of twin observes this claim.
// Each realm element supplies its own nested pattern on every iteration.
for (const { Array: { from }, JSON: J } of [globalThis, self]) from([J]);
