// An array wrapper in a loop initializer preserves the static's result type.
for (const [{ from: make, ...rest }] = (effect(), [Array]); keepGoing();) use(make([1]).at(0), rest);
