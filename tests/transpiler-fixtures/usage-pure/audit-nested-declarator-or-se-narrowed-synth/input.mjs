// an effectful `||` init narrows the replacement to the LEFT TAIL: the effect prefix keeps
// running in place, the literal (always truthy, like the global it mirrors) keeps
// short-circuiting, and the dead right side stays verbatim
let c = 0;
const { Array: { from } } = (c++, globalThis) || self;
from([1]);
