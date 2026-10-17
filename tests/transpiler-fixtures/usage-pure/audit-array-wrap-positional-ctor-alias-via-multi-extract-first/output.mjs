import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// two whole-ctor extractions off ONE declarator keep their own per-name registrations: each
// alias's STATIC read folds through its own hint (a single per-declarator entry let the second
// registration clobber the first, stranding the first alias's reads on the local name)
const [{
  Symbol: SM
}, {
  Promise: MG
}] = [{
  Symbol: _Symbol
}, {
  Promise: _Promise
}];
export const viaMultiExtractFirst = _Symbol$for(dedupeKey);