// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const out = [];
var { at, flat } = [1, 2];
out.push(typeof at, typeof flat);

var { at: at2, ...rest } = [3, 4];
out.push(typeof at2, 'at' in rest);
export { out };
