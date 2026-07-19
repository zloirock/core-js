// trivia (comments / line breaks) between a dropped optional hop and the surviving leaf: the re-hung
// guard must fuse with the leaf's first significant token, not the raw text edge
let a;
export const viaBlockComment = (a = globalThis.window)?.self /* gap */ ['Array'].from([3]);
// a dotted leaf behind trivia moves its own dot onto the connector - `? .` split by trivia does not parse
let b;
export const viaDottedGap = (b = globalThis.window)?.self /* gap */ .Array.of(4);
let c;
export const viaLineComment = (c = globalThis.window)?.self // gap
['Object'].entries('q');
