// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
const { Array: { from }, ...rest } = (sideEffect(), globalThis);
