// A `||` / `??` whose every operand names one global, its last one never nullish - a bare name, which throws
// where the engine lacks the global - yields that global whichever operand runs, so a member or `in` read over it
// takes the static's pure entry though its left decides nothing (a probe of `window`, absent off-window); a
// pattern reads the left's static on its own route either way. An alias as the last operand - its own walk, asked
// at every level of an alias chain, is the exponential class - and an `&&` keep the selection; so do operands
// naming different globals, an `Object` arm's static served through the identity guard.
const list = [1, 2];
export const viaMember = (globalThis.window?.Map ?? Map).groupBy(list, x => x);
export const viaIn = 'groupBy' in (globalThis.window?.Map || Map);
const { groupBy: viaPattern } = globalThis.window?.Map ?? Map;
export { viaPattern };
export const viaChain = (globalThis.window?.Map ?? self.Map ?? Map).groupBy(list, x => x);
export const disagreeing = (globalThis.window?.Map ?? Object).groupBy(list, x => x);
const AliasMap = Map;
export const aliasLast = (globalThis.window?.Map ?? AliasMap).groupBy(list, x => x);
export const both = (globalThis.window?.Map && Map).groupBy(list, x => x);
