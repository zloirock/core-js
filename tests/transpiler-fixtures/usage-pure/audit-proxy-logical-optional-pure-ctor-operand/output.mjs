import _Map from "@core-js/pure/actual/map";
// An OPTIONAL-chain pure-constructor proxy-global operand in a LOGICAL receiver whole-swaps to the
// pure constructor (`globalThis?.self?.Map` -> `_Map`), like a non-optional one - an optional chain
// is not a side-effect prefix, so it must not be left verbatim. The substituted root is always
// defined, so the redundant optional connectors collapse away - the selection over it folding to it, or the
// operand swapped in place right of a left the build does not decide.
const {
  groupBy,
  ...rest
} = _Map;
groupBy([], item => item);
const {
  groupBy: viaRight,
  ...others
} = maybe || _Map;
viaRight([], item => item);