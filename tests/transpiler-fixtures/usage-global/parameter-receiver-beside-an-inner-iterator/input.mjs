// Only the outer argument list is iterated. An own iterator on its Array receiver
// does not change the value supplied by the pristine outer literal spread.
const value = [1];
value[Symbol.iterator] = function* () { yield 'text'; };
function read({ at }) { return at.call([7], 0); }
export const result = read(...[value]);
