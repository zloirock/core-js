import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
// A handed-out local class named AggregateError does not widen the realm constructor.
function hand(x) {
  _globalThis.taken = x;
}
{
  class AggregateError {}
  hand(AggregateError);
}
new _AggregateError([]);