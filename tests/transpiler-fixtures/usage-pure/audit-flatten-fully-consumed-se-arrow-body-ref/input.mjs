// An initializer prefix IIFE runs once before the static binding.
// Its instance call keeps a declared local receiver temporary.
const { Array: { from } } = ((() => [].values())(), globalThis);
from([]);
