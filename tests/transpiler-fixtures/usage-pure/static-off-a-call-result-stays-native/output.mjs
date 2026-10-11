import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a static read off a call result stays native whatever spells the call - parenthesized, a sequence callee,
// an argument with an effect, which keeps its own claim, an optional call
const log = [];
{
  const f = id(Array).from;
  const g = (0, id)(Array).from;
}
{
  const f = id(Array).from;
}
{
  const f = id(Array, _pushMaybeArray(log).call(log, 2)).from;
}
{
  const f = id?.(Array).from;
}