const box = {};
// Realm selections mirror the chosen default. Foreign fallback values remain native.
// Unbacked probes retain their own selection behavior.
export const selecting = (() => {
  let gb;
  ({ k: { Map: { groupBy: gb }, Promise: { race: box.race } } = globalThis.window ?? globalThis } = {});
  const { k: { Map: { groupBy: gb2 }, Promise: { customZ: z } } = globalThis.window ?? globalThis } = {};
  const [{ Map: { groupBy: gb3 } } = globalThis.window ?? globalThis] = [];
  // A spread leaves its paired slot unknown; a foreign fallback stays native.
  const extra = {};
  let gb4, gb5, gb6;
  ({ k: { Map: { groupBy: gb4 } } = globalThis.window ?? globalThis } = { ...extra });
  ({ k: { Map: { groupBy: gb5 } } = self ?? globalThis } = {});
  ({ k: { Map: { groupBy: gb6 } } = globalThis.window ?? extra } = {});
  return [gb, gb2, z, gb3, gb4, gb5, gb6, box];
})();
export const r = [box];
