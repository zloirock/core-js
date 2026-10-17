import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
// A handed-out local class named AggregateError does not widen the realm constructor.
function hand(x) {
  globalThis.taken = x;
}
{
  class AggregateError {}
  hand(AggregateError);
}
new AggregateError([]);