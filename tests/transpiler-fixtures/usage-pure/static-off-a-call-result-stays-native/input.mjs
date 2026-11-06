// a static read off a call result stays native whatever spells the call - parenthesized, a sequence callee,
// an argument with an effect, which keeps its own claim, an optional call
const log = [];
{
const f = (id(Array)).from; const g = (0, id)(Array).from;
}
{
const f = id(Array).from;
}
{
const f = id(Array, log.push(2)).from;
}
{
const f = id?.(Array).from;
}
