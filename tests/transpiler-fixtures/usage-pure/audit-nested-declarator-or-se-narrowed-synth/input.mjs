// an effectful `||` init narrows the replacement to the LEFT TAIL: the effect prefix keeps
// running in place, and the literal (always truthy, like the global it mirrors) decides the
// selection, so the dead right side drops with it
let c = 0;
const { Array: { from } } = (c++, globalThis) || self;
from([1]);
