// Inner defaults replace their receiver whole where a mirror can carry its keys.
// Quoted keys retain native reads; declined rest and unknown supplied receivers stay native.
// Member targets and repeated flat keys retain the same mirror as ordinary bindings.
const getKey = () => 'Map';
const box = {};
let S, M, alias, of, rest, race, d;

[{ Set: S, 'with-dash': d, Array: { of } } = globalThis] = [];
[{ Map: M, ['Map']: alias, Array: { of } } = globalThis] = [];
[{ Set: S, Array: { of }, ...rest } = globalThis] = [];
[{ Array: { of } } = globalThis] = [];
[{ Array: { of }, 'with-dash': d, Promise: { race } } = globalThis] = [];
[{ Set: S, Array: { of: box.of } } = globalThis] = [];

export const caught = (() => {
  try {
    throw [];
  } catch ([{ Set: CS, 'with-dash': cd, Array: { of: cof } } = globalThis]) {
    return [CS, cd, cof];
  }
})();

export const keyed = (() => {
  const { k: { Set: KS, [getKey()]: y, Array: { of: kof } } = globalThis } = {};
  const { k: { Array: { of: only } } = globalThis } = {};
  return [KS, y, kof, only];
})();

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
export const wrapped = (() => {
  const [{ Set: WS, 'with-dash': wd, Array: { of: wof } } = globalThis] = [];
  const [{ Array: { of: wonly } } = globalThis] = [];
  return [WS, wd, wof, wonly];
})();

export const r = [S, M, alias, of, rest, race, d, box];
