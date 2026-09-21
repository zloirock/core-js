// A loop initializer retains its prefix IIFE and the instance call inside it.
// The function owns its receiver temporary before the static binding initializes.
for (const { Array: { from } } = ((() => [].values())(), globalThis); false;) from([]);
