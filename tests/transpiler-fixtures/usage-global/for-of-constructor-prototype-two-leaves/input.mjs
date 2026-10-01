// Both leaves of a nested prototype head use the same array receiver type.
// Moving the head into the body retains the whole element separately from each leaf.
for (const { w: { prototype: { at, includes } } } of [{ w: Array }]) use(at, includes);
