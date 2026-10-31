// An installed parameter default keeps both instance claims on the value written by the default.
let installed;
function read(first = 0, { at, flat } = (installed = [1]), last = 0) { return [first, at, flat, last]; }
const result = read(effect(), undefined, effect());
export { installed, result };
