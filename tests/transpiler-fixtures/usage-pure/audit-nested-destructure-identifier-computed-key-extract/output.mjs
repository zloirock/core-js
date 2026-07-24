import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a nested proxy-destructure whose computed key is an Identifier binding (`[K]`) folds K scope-aware
// and EXTRACTS the static + imports its module, exactly like a literal `["groupBy"]` - not a residual
// reading an unimported static off the pure ctor (undefined at runtime). the fold applies at the INNER
// key (`{ Ctor: { [K]: m } }`) and the OUTER ctor key (`{ [K]: { m } }`), const-bound and reassigned-
// dominating alike. distinct static per line
const K1 = 'groupBy';
const gb = _Map$groupBy;
let K2 = 'of';
K2 = 'from';
const af = _Array$from;
const K3 = 'Object';
const og = _Object$groupBy;
const pwr = _Promise$withResolvers;
gb([[1]]);
af([1]);
og([1, 2], x => x % 2);
pwr();