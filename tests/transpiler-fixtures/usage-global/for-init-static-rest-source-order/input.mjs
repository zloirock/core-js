// The initializer runs before the extracted binding, including its temporal dead zone.
for (const { Array: { from }, ...rest } = (observe(() => from), globalThis); keepGoing();) {
  use(from([1]), rest);
}
