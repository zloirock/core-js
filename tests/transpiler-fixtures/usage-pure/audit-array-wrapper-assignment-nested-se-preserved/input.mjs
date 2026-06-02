let from;
([{ Array: { from } }] = [(sideEffect(), globalThis)]);
from([1, 2, 3]);
