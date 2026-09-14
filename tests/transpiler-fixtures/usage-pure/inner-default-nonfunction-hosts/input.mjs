// An inner default on a NON-function host - an assignment, a catch parameter, an object key, a
// declarator's array wrapper - takes the per-key fallback chain a parameter's does. Where the
// mirror declines (a non-identifier key, a duplicate key, a rest beside the leaves) every static
// leaf keeps the inline default, the nested one included; a pattern spelling only nested leaves
// mirrors the default from them; and a member target beside the leaves (an assignment-only shape)
// leaves the flat leaf its inline default. Both legs print the same shapes.
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

// ... and a value-SELECTING inner default is the per-branch mirror's shape on every host: the leaf
// reads that default exactly when the host's slot is empty, and the mirror fills the default's arms
// (a member target riding raw beside the ponyfilled leaf)
export const selecting = (() => {
  let gb;
  ({ k: { Map: { groupBy: gb }, Promise: { race: box.race } } = globalThis.window ?? globalThis } = {});
  const { k: { Map: { groupBy: gb2 }, Promise: { customZ: z } } = globalThis.window ?? globalThis } = {};
  const [{ Map: { groupBy: gb3 } } = globalThis.window ?? globalThis] = [];
  // ... a host slot no pairing reads through (a spread) still hands the pattern its default, and an
  // ALL-proxy selecting default takes the shared plan's literal in place of the whole selection
  const extra = {};
  let gb4, gb5;
  ({ k: { Map: { groupBy: gb4 } } = globalThis.window ?? globalThis } = { ...extra });
  ({ k: { Map: { groupBy: gb5 } } = self ?? globalThis } = {});
  return [gb, gb2, z, gb3, gb4, gb5, box];
})();

export const wrapped = (() => {
  const [{ Set: WS, 'with-dash': wd, Array: { of: wof } } = globalThis] = [];
  const [{ Array: { of: wonly } } = globalThis] = [];
  return [WS, wd, wof, wonly];
})();

export const r = [S, M, alias, of, rest, race, d, box];
