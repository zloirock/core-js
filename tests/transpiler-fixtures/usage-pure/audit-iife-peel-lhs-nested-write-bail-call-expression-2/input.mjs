const sink = {};
const viaMemberKey = (arg => {
  sink[arg = Promise] = 1;
  return arg;
})(Array);
const { of } = viaMemberKey;
export const r2 = of(3);
