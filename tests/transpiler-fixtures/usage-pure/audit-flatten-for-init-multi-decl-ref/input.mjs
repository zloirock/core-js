// A loop initializer keeps its effectful function call before the static binding.
// The function retains its instance polyfill and local receiver temporary.
for (let idx = 0, { Array: { from } } = ((() => [].values())(), globalThis); idx < 1; idx++) from([idx]);
