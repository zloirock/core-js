import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
const groupBy = _Map$groupBy;
// An OPTIONAL-chain pure-constructor proxy-global operand in a LOGICAL receiver whole-swaps to the
// pure constructor (`globalThis?.self?.Map` -> `_Map`), like a non-optional one - an optional chain
// is not a side-effect prefix, so it must not be left verbatim. The substituted root is always
// defined, so the redundant optional connectors collapse away.
const {
  groupBy: _unused,
  ...rest
} = _Map || _Set;
groupBy([], item => item);