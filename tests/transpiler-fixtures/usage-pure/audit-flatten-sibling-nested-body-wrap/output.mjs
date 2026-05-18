import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// outer flatten on decl[0] + sibling decl[1] arrow with NESTED arrow bodies, each needing
// its own body-wrap (`var _ref;` / `var _ref2;` for instance-method `.at()` calls). flatten
// flushes drain ref-bindings via `consumeRefBindingsInRange` which collects both wraps in
// range. previously `spliceInRange` applied them as flat splices - the outer wrap's content
// captures original source (including raw inner arrow body), and the descending-position
// iteration applied inner first then outer; outer's overwrite clobbered the inner's wrap
// because outer's content slice didn't reflect the inner wrap. fix: pre-compose nested
// wraps in `consumeRefBindingsInRange` so only the outermost is emitted as a splice, with
// inner wrap text substituted into the outer's local-offset position
const from = _Array$from;
const sibling = () => {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0) + (() => {
    var _ref2;
    return _atMaybeArray(_ref2 = [2]).call(_ref2, 0);
  })();
};
console.log(from, sibling());