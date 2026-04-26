// for-loop init with a nested proxy access that destructures multiple inner
// properties: each inner site must rewrite independently.
for (const { Array: { from, of } } = globalThis, i = 0; i < 1; i++) from([of(i)]);
