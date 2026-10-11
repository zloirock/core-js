// an instance method nested in an array element of a selection the build decides behind an effect
// prefix: each level reads off the value the selection yields, so the leaf dispatches on that array as
// it does for the array spelled alone
const user = {};
const [[{ at }]] = [(eff(), typeof Symbol != 'undefined' ? [[1]] : [user])];
const [[{ flat }]] = [(eff(), typeof Symbol != 'undefined' && [[2]])];
const [[{ includes }]] = [(eff(), [[3]] || [user])];
export { at, flat, includes };
