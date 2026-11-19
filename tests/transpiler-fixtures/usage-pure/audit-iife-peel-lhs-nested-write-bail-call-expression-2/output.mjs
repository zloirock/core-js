import _Promise from "@core-js/pure/actual/promise/constructor";
const sink = {};
const viaMemberKey = (arg => {
  sink[arg = _Promise] = 1;
  return arg;
})(Array);
const {
  of
} = viaMemberKey;
export const r2 = of(3);