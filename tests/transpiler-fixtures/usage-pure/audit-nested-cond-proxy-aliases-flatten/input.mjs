// A pure selection whose arms name the same realm serves one pure static.
// No runtime branch is needed to choose the method.
let c = true;
const { Array: { from } } = c ? globalThis : self;
from([1]);
