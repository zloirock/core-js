import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// the FOR-INIT host twin of the anchored-residual: a multi-ctor declarator in a for-statement init
// slot whose residual leaf off a MISSING-ABLE ctor (`Set.union`) must read off the pure CONSTRUCTOR
// binding (`{ union } = _Set`) while the consumed leaf extracts via its own import (`from = _Array$from`).
// the for-init flatten renderer is a distinct host from the block declarator / assignment cascade
for (let from = _Array$from, {
    union
  } = _Set; from && union;) {
  break;
}