import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
// trivia (comments / line breaks) between a dropped optional hop and the surviving leaf: the re-hung
// guard must fuse with the leaf's first significant token, not the raw text edge
let a;
export const viaBlockComment = (a = _globalThis.window)?. /* gap */ ['Array'].from([3]);
// a dotted leaf behind trivia moves its own dot onto the connector - `? .` split by trivia does not parse
let b;
export const viaDottedGap = (b = _globalThis.window)?. /* gap */ Array.of(4);
let c;
export const viaLineComment = (c = _globalThis.window)?. // gap
['Object'].entries('q');