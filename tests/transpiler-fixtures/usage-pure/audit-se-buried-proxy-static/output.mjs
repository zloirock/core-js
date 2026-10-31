import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an SE-buried proxy-global root still classifies (pure shape classification - the SE
// prefix stays in the source and runs exactly once): a paren-only peel left the chain
// unclassified, under-injecting the static and crashing unplugin's compose on the
// receiver-subtree overlap
const r = (eff(), _Map$groupBy)(items, fn);
const d = (e1(), _Array$from)([1]);