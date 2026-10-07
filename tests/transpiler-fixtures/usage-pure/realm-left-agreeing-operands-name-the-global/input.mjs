// A `||` / `??` whose every operand names one global, its last one never nullish - a bare name, which throws
// where the engine lacks the global - yields that global whichever operand runs, so a member or `in` read over it
// takes the static's pure entry though the build decides nothing (`Map` excluded); a pattern reads the left's static
// on its own route either way. A last operand that may be nullish, an alias anywhere - its own walk, asked at every
// level of an alias chain, is the exponential class - and an `&&` keep it native; operands naming different globals
// keep the selection too, an `Object` arm's static served through the identity guard.
const list = [1, 2];
export const viaMember = (globalThis.Map ?? Map).groupBy(list, x => x);
export const viaIn = 'groupBy' in (globalThis.Map || Map);
const { groupBy: viaPattern } = self.Map ?? Map;
export { viaPattern };
export const viaChain = (globalThis.Map ?? self.Map ?? Map).groupBy(list, x => x);
export const nullishLast = (globalThis.Map ?? self.Map).groupBy(list, x => x);
export const disagreeing = (globalThis.Map ?? Object).groupBy(list, x => x);
const AliasMap = Map;
export const aliasLast = (globalThis.Map ?? AliasMap).groupBy(list, x => x);
const RealmMap = globalThis.Map;
export const aliasOperand = (RealmMap ?? Map).groupBy(list, x => x);
export const both = (globalThis.Map && Map).groupBy(list, x => x);
