// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
var { from, ...r1 } = Array, { resolve, ...r2 } = Promise;
