const trigger = 1, [{ Array: { from } }] = [(sideEffect(), globalThis)];
from([1, 2, 3]);
trigger;
