import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A selected realm mirrors enabled static leaves beside an opted-out sibling.
// The disabled key retains its raw source read in both parameter defaults and assignments.
export function opt({
  Array: {
    from: fr,
    // core-js-disable-next-line
    of
  }
} = c ? {
  Array: {
    from: _Array$from,
    of: _globalThis.Array.of
  }
} : fb) {
  return [fr, of];
}
let fe, oe;
({
  Object: {
    fromEntries: fe,
    // core-js-disable-next-line
    entries: oe
  }
} = c ? {
  Object: {
    fromEntries: _Object$fromEntries,
    entries: _globalThis.Object.entries
  }
} : fb);