import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// The residual's fallback read goes through the polyfilled `Symbol` BINDING, so which entry that
// binding names is the resolver's question, not this render's. A `Symbol` whose members the census
// cannot name (`delete Symbol[k]`) must carry its statics itself - the bare constructor entry
// installs none - and the read below is exactly one of the reads that rule exists for. Spelling the
// entry by hand here bypassed the rule and minted a second import beside the one it already had.
delete _Symbol[k];
const {
  [_Symbol.foo]: c
} = _WeakMap;
const fe = _Object$fromEntries;
export default [c, fe];