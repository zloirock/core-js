// a conditional-receiver destructure binding a computed key off a bare global ([Set]) beside a key
// polyfillable on both branches. The bare global is one THIS PASS substitutes, so the literal takes
// the binding the key is rewritten to and never the raw name an ie:11 ReferenceError would come from
// - the pattern folds per branch and both `from` reads get their ponyfill, where asking the
// pre-rewrite spelling left them native on a floor without `Array.from`.
const cond = true;
const { from, [Set]: ctor } = cond ? Array : Iterator;
from([1, 2, 3]);
ctor;
