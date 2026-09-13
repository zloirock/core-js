// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { Array: { from }, ...rest } = globalThis;
const xs = from('hi');
xs.at(0);
xs.includes('h');
xs.flat();
