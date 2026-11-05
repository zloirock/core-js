import _globalThis from "@core-js/pure/actual/global-this";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
// A nested first element does not hide the following element's Number hint.
// The wrapper stays native and the later parseFloat call resolves through that second binding.
/* eslint-enable no-redeclare, vars-on-top, block-scoped-var -- end of redeclaration shapes */

// a nested wrapper sibling that does NOT bind the name must not abort the positional scan
// (its subtree's "not found" is not a terminal answer) - the later element still resolves;
// a slot that DOES bind the name but cannot pair (spread-shifted inner init) keeps bailing
const [[{
  URL: XU
}], {
  Number: NP
}] = [[_globalThis], _globalThis];
export const viaScanPastNestedSibling = _Number$parseFloat(text);