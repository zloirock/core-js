// Writes inside assignment targets prevent treating the result as the original argument.
// Accepted limitation: the default write is not proven to discard the incoming Array.
// This injects the full Array family despite no real constructor escape; the extra injection
// is retained to avoid deeper flow analysis for this uncommon shape.
let x;
const viaLhsDefault = (arg => {
  ({ x = (arg = Promise) } = {});
  return arg;
})(Array);
const { from } = viaLhsDefault;
export const r1 = from([1, 2]);
const sink = {};
const viaMemberKey = (arg => {
  sink[arg = Promise] = 1;
  return arg;
})(Array);
const { of } = viaMemberKey;
export const r2 = of(3);
const counts = { rebound: 0 };
const viaUpdateKey = (arg => {
  counts[arg = Promise]++;
  return arg;
})(Array);
const { from: fu } = viaUpdateKey;
export const r3 = fu([4]);
// positive controls: non-param write in an LHS default / param read in a key still peel.
// distinct constructors from the bail cells, so a bail regression is visible in the import set
let other = 0;
const okOtherWrite = (arg => {
  ({ x = (other = 1) } = {});
  return arg;
})(Object);
const { groupBy: gb } = okOtherWrite;
export const r4 = gb([5], v => v);
const dict = {};
const okKeyRead = (arg => {
  dict[String(arg.name)] = 2;
  return arg;
})(Reflect);
const { ownKeys: ok } = okKeyRead;
export const r5 = ok({ a: 1 });
