// A native element beside a realm element keeps its own static read.
for (const { Array: { of } } of [globalThis, { Array: { of: null } }]) of(1);
