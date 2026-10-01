// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { from } = Array, { resolve } = Promise, x = 1, { includes, ...rest } = obj;
