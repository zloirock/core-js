import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// A stored literal object keeps its native static read in the loop head.
// Map and Promise remain full constructors so those retained reads have their statics.
let cache;
for (const {
  D: {
    groupBy
  }
} of [cache = {
  D: _Map
}]) console.log(groupBy);
const box = {
  D: _Promise
};
for (const {
  D: {
    allSettled
  }
} of [box]) console.log(allSettled);