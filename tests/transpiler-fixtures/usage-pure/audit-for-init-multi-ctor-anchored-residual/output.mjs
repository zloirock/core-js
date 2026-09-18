import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// the FOR-INIT host twin of the anchored-residual: a multi-ctor declarator in a for-statement init
// slot whose residual leaf off a MISSING-ABLE ctor (`Set.customQ`) must read off the pure CONSTRUCTOR
// binding (`{ customQ } = _Set`) while the consumed leaf extracts via its own import (`from = _Array$from`).
// the for-init flatten renderer is a distinct host from the block declarator / assignment cascade
// the residual keys here are ones NEITHER surface carries: a key core-js spells as a PROTOTYPE
// entry of that constructor (`Set.union`) is handed out as a static by the pure binding and by
// nothing else, so such a leaf declines the anchor and would measure that rule instead of this one
for (let from = _Array$from, {
    customQ
  } = _Set; from && customQ;) {
  break;
}