// An OPTIONAL-chain pure-constructor proxy-global operand in a LOGICAL receiver whole-swaps to the
// pure constructor (`globalThis?.self?.Map` -> `_Map`), like a non-optional one - an optional chain
// is not a side-effect prefix, so it must not be left verbatim. The substituted root is always
// defined, so the redundant optional connectors collapse away.
const { groupBy, ...rest } = globalThis?.self?.Map || Set;
groupBy([], item => item);
