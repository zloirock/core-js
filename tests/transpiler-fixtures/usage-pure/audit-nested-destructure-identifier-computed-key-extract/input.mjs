// a nested proxy-destructure whose computed key is an Identifier binding (`[K]`) folds K scope-aware
// and EXTRACTS the static + imports its module, exactly like a literal `["groupBy"]` - not a residual
// reading an unimported static off the pure ctor (undefined at runtime). the fold applies at the INNER
// key (`{ Ctor: { [K]: m } }`) and the OUTER ctor key (`{ [K]: { m } }`), const-bound and reassigned-
// dominating alike. distinct static per line
const K1 = 'groupBy';
const { Map: { [K1]: gb } } = globalThis;
let K2 = 'of';
K2 = 'from';
const { Array: { [K2]: af } } = globalThis;
const K3 = 'Object';
const { [K3]: { groupBy: og }, Promise: { withResolvers: pwr } } = globalThis;
gb([[1]]);
af([1]);
og([1, 2], x => x % 2);
pwr();
