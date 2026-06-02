const { from, ...rest } = (sideEffect(), globalThis.self.Array);
from([1, 2, 3]);
rest;
