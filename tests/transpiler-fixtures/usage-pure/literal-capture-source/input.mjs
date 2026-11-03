// A residual over a generated capture keeps its original literal source.
let from, at;
({ C: { from }, values: { at } } = { C: Array, values: [1] });
use(from, at);
