// an SE-PREFIXED computed hop key still RESOLVES for the guard count: the memo composes with the
// probe rather than testing its result again, so ONE test stands and the effect rides the composed
// leaf into the branch - still once, still in source order after the window test
let keyEff = 0;
const sk = () => globalThis;
export const viaSeComputedOwnKey = sk()?.window?.[(keyEff++, 'self')]?.Array.of(19).at(0);
