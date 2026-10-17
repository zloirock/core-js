import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// Branching container slots do not prove a single static receiver. An arm that is a native static
// owner guards the static it names against the captured slot, as a bare selecting alias guards it
// against the captured constructor; an arm pure swaps whole reads its own statics, and one naming
// no such static leaves the read native. Each row names a distinct method.
const c = typeof document == 'undefined';
// branching between container ALIASES
const nsLeft = {
  Base: Object
};
const nsRight = {
  Base: _Map
};
const aliasBranch = c ? nsLeft : nsRight;
export const viaAlias = (_ref = aliasBranch.Base, _ref === Object ? _Object$groupBy([], x => x) : _ref.groupBy([], x => x));