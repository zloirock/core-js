import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// Writes inside assignment targets prevent treating the result as the original argument.
// The default keeps the global fixture's conservative escape classification, not a real leak.
// Deeper flow analysis for this uncommon shape is deliberately omitted. Pure keeps Array and
// the affected method reads native, while Promise is still substituted.
let x;
const viaLhsDefault = (arg => {
  ({
    x = arg = _Promise
  } = {});
  return arg;
})(Array);
const {
  from
} = viaLhsDefault;
export const r1 = from([1, 2]);
const sink = {};
const viaMemberKey = (arg => {
  sink[arg = _Promise] = 1;
  return arg;
})(Array);
const {
  of
} = viaMemberKey;
export const r2 = of(3);
const counts = {
  rebound: 0
};
const viaUpdateKey = (arg => {
  counts[arg = _Promise]++;
  return arg;
})(Array);
const {
  from: fu
} = viaUpdateKey;
export const r3 = fu([4]);
// positive controls: non-param write in an LHS default / param read in a key still peel.
// distinct constructors from the bail cells, so a bail regression is visible in the import set
let other = 0;
const okOtherWrite = (arg => {
  ({
    x = other = 1
  } = {});
  return arg;
})(Object);
const gb = _Object$groupBy;
export const r4 = gb([5], v => v);
const dict = {};
const okKeyRead = (arg => {
  dict[String(_nameMaybeFunction(arg))] = 2;
  return arg;
})(_Reflect);
const ok = _Reflect$ownKeys;
export const r5 = ok({
  a: 1
});