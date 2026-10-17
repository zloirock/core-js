// A caller mirror inside a parameter default owns the captured receiver in that activation.
// Native sibling getters close over that capture after the literal has been constructed.
function methods({ at, flat, length }) { return [at, flat, length]; }
export function read(result = methods([1, [2]])) { return result; }
