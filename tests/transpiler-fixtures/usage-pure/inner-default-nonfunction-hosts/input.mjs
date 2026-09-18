// An inner default on a NON-function host - an assignment, a catch parameter, an object key, a
// declarator's array wrapper - takes the per-key fallback chain a parameter's does. Where the
// mirror declines (a non-identifier key, a repeated HOP key, a rest beside the leaves) every static
// leaf keeps the inline default, the nested one included; a key repeated over LEAVES does not
// decline it - one slot is one property, and the literal replaces the default whole; a pattern spelling only nested leaves
// mirrors the default from them; and a member target beside the leaves (an assignment-only shape)
// rides the mirror like any slot once its ROOT proves writable, so the flat leaf keeps no inline
// default there. Both legs print the same shapes.
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

// ... and a value-SELECTING inner default fills the default's arms, a member target taking the
// ponyfill in its own slot beside the sibling leaf. A selection every arm of which is the REALM names ONE object, so the
// literal replaces it whole - left standing, the probe selects natively wherever the host HAS
// `window`, and the polyfill the fallback arm carries attaches nowhere. The slot a literal cannot
// spell anchors on the operand the selection yields through, never on the probe's unbacked name
export const selecting = (() => {
  let gb;
  ({ k: { Map: { groupBy: gb }, Promise: { race: box.race } } = globalThis.window ?? globalThis } = {});
  const { k: { Map: { groupBy: gb2 }, Promise: { customZ: z } } = globalThis.window ?? globalThis } = {};
  const [{ Map: { groupBy: gb3 } } = globalThis.window ?? globalThis] = [];
  // ... a host slot no pairing reads through (a spread) still hands the pattern its default, and a
  // BARE backed left reaches the same literal by the other road - its right is dead rather than
  // realm-equal. A fallback the plan may not speak for is the negative: the selection stays whole
  // and native, so neither arm is polyfilled
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
