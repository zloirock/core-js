// the root stays buried under an effect-bearing body and under a computed key carrying its own
// effect - both keep it inside the kept test, so the substitution has to reach it there too
let bodyCount = 0;
export const effectfulBodyRoot = (() => {
  bodyCount++;
  return globalThis;
})()?.window?.Object.entries({ a: 1 }).findLastIndex(pair => pair[0] === 'a');
