// A relocated head keeps its scope and the extracted static's result type.
for (const { from: make, ...rest } of [Array]) use(make([1, 2]).at(-1), rest);
