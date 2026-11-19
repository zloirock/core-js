// Each default and source slot can write the same member target.
({ self: { Array: { from: sink.method } } = { Array } } = globalThis);
sink.method([3]);
