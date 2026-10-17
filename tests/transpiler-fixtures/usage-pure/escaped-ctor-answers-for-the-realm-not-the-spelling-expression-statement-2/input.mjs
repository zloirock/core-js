// A handed-out local class named AggregateError does not widen the realm constructor.
function hand(x) {
  globalThis.taken = x;
}
{
  class AggregateError {}
  hand(AggregateError);
}
new AggregateError([]);
