// A changed outer array iterator supplies the parameter's actual receiver.
// Its literal element cannot prove an Array-only instance helper.
Array.prototype[Symbol.iterator] = function* () { yield 'text'; };
function read({ at }) { return at.call('ok', 0); }
export const result = read(...[[1]]);
