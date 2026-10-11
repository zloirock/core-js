import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a `||` whose left yields a fresh object behind an effect prefix or a store decides for that left, as
// the fresh object spelled alone does: the right never runs, so its arm names nothing, and a leaf under a
// store extracts as under the store spelled alone, in a declaration and an assignment alike - `Array` too,
// a constructor pure never respells, whose static a native read off the slot would miss
export const {
  C: {
    groupBy
  }
} = (console.log(), {
  C: {
    groupBy: _Map$groupBy
  }
});
let stash;
stash = {
  C: _Iterator
};
export const from = _Iterator$from;
let held;
held = {
  C: Array
};
export const of = _Array$of;
let box, fromAsync;
box = {
  C: Array
};
fromAsync = _Array$fromAsync;
export { stash, held, box, fromAsync };