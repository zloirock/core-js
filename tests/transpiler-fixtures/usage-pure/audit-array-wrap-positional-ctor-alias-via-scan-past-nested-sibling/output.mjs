import _globalThis from "@core-js/pure/actual/global-this";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _URL from "@core-js/pure/actual/url/constructor";
/* eslint-enable no-redeclare, vars-on-top, block-scoped-var -- end of redeclaration shapes */

// a nested wrapper sibling that does NOT bind the name must not abort the positional scan
// (its subtree's "not found" is not a terminal answer) - the later element still resolves;
// a slot that DOES bind the name but cannot pair (spread-shifted inner init) keeps bailing
const [[{
  URL: XU
}], {
  Number: NP
}] = [[{
  URL: _URL
}], _globalThis];
export const viaScanPastNestedSibling = _Number$parseFloat(text);