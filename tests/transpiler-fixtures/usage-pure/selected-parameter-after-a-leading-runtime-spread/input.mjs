// A leading spread can supply a parameter even when its source literal is empty.
// The caller's later true does not decide this parameter's receiver selection.
Array.prototype[Symbol.iterator] = function* () { yield false; };
function read(flag) { return (flag ? [1] : 'text').includes('e'); }
export const result = read(...[], true);
