// A left the build serves leaves no other logical operand live: `globalThis.self.Array`, and
// `globalThis.self.Number`, a global core-js extends in place, land on the backed proxy root
// (`_self`) alone. The selected receiver is evaluated once for the polyfilled property and the
// copy of the remaining keys.
const g = globalThis;
const { from, ...rest } = globalThis.self.Array || g.self.Set || Map;
from([1]);
const { isInteger, ...others } = globalThis.self.Number || g.self.Set;
isInteger(1);
