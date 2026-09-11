import _Map from "@core-js/pure/actual/map/constructor";
// a proxy-global member chain nested in a literal receiver: the member READ makes the literal
// unsafe to emit twice (a Proxy trap on the source would re-fire), so the extraction bails and the
// binding stays native - the in-place visitor still rewrites the whole-constructor member to `_Map`
const {
  [(eff(), 'flat')]: m
} = [1, _Map];