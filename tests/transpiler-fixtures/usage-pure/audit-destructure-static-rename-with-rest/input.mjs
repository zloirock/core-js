// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { from: customFrom, ...rest } = Array;
const xs = customFrom('hi');
xs.at(0);
xs.findLastIndex(p => p);
xs.flat();
