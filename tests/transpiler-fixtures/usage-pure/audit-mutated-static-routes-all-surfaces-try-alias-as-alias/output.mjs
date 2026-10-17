import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A mixed pattern keeps its mutated static on the constructor and substitutes its clean sibling.
const {
  Promise: {
    try: tryAlias,
    allSettled: asAlias
  }
} = {
  Promise: {
    try: _Promise$try,
    allSettled: _Promise.allSettled
  }
};
_Promise.allSettled = asPatch;
export const r11 = [tryAlias, asAlias];