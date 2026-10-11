import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a static read through a container a decided selection yields, in an assignment whose value is used,
// takes the slot default its plain twin takes: off a ternary, an `&&`, and a `||` whose left is a fresh
// object
let attempt, groupBy, from;
export const viaTernary = () => ({
  C: {
    try: attempt = _Promise$try
  }
} = {
  C: _Promise
});
export const viaAnd = () => ({
  C: {
    groupBy = _Map$groupBy
  }
} = {
  C: _Map
});
export const viaOr = () => ({
  C: {
    from = _Iterator$from
  }
} = {
  C: _Iterator
});
export { attempt, groupBy, from };