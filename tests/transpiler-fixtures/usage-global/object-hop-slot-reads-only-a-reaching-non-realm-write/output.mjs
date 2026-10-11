import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A reassigned binding in an object hop slot reads every value its writes may leave there, as the flat
// spelling does: a non-realm write that may reach the read dispatches the key as an instance method.
// One a later write always overwrites before the read leaves the realm there, which dispatches none
const other = {};
var reaching = globalThis;
if (flag) reaching = other;
const {
  w: {
    findLast: hopRows
  }
} = {
  w: reaching
};
const {
  findLastIndex: flatRows
} = reaching;
var overwritten = globalThis;
overwritten = other;
overwritten = self;
const {
  w: {
    toSorted: noHopRows
  }
} = {
  w: overwritten
};
const {
  toReversed: noFlatRows
} = overwritten;
export { hopRows, flatRows, noHopRows, noFlatRows };