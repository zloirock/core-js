// Identifier reference suppressed by a `core-js-disable-next-line` directive.
// Post-sweep walks Identifiers in usage-pure mode; the `shouldSkipPath` predicate
// checks `disabledLines` so the directive still applies after the primary pass.
const v = arr.at(0);
// core-js-disable-next-line
const fresh = Map;
const back = arr.findLastIndex(x => x === v);
export { v, fresh, back };
