import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
// trivia (comments / line breaks) between a dropped optional hop and a claimable static leaf: the
// guarded claim must swallow the hop TOGETHER with its trailing trivia - trivia stranded between the
// guard and the claim body would desync the emitters or break the parse
let a;
export const viaBlockComment = null == (a = _globalThis.window) ? void 0 : _Array$from([3]);
// a dotted leaf behind trivia claims the same way - the claim is connector-independent
let b;
export const viaDottedGap = null == (b = _globalThis.window) ? void 0 : _Array$of(4);
let c;
export const viaLineComment = null == (c = _globalThis.window) ? void 0 : _Object$entries('q');