// trivia (comments / line breaks) between a dropped optional hop and a claimable static leaf: the
// guarded claim must swallow the hop TOGETHER with its trailing trivia - trivia stranded between the
// guard and the claim body would desync the emitters or break the parse
let a;
export const viaBlockComment = (a = globalThis.window)?.self /* gap */ ['Array'].from([3]);
// a dotted leaf behind trivia claims the same way - the claim is connector-independent
let b;
export const viaDottedGap = (b = globalThis.window)?.self /* gap */ .Array.of(4);
let c;
export const viaLineComment = (c = globalThis.window)?.self // gap
['Object'].entries('q');
