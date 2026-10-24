// A visible prototype iterator replacement invalidates stored-element proofs.
// Pure keeps the array pattern native; global still injects for the possible static.
Array.prototype[Symbol.iterator] = function* () { yield { is: () => false }; };
const wrapped = [{ k: [Object] }];
const [{ k: [{ is }] }] = wrapped;
is(1, 1);
