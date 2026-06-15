// A redundant proxy-global hop (`.self`) off a CONST-ALIASED global object must collapse in the
// retained destructure receiver, the same as off a direct `globalThis`. `g` is an alias of the
// global (`const g = globalThis`), so `g.self` reads an undefined property on ie:11 / non-browser
// hosts - the rest-destructure would throw. The alias stays (`g`, already rewritten to _globalThis
// by its own declaration); only the `.self` hop drops, giving `g.Array`. (top-level const path)
const g = globalThis;
const { from, ...rest } = g.self.Array;
from([1]);
