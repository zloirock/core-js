import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$rawJSON from "@core-js/pure/actual/json/raw-json";
// a logical object is still an unconditionally-reached spine: both arms lead to the member
// access, so the key always evaluates - static narrow
let JK;
(a ?? b)[{
  JSON: JK
} = _globalThis].c;
export const viaLogicalSpineKey = _JSON$rawJSON(input);