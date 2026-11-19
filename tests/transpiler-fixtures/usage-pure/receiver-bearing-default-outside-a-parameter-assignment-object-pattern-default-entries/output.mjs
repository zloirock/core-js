import _Object$entries from "@core-js/pure/actual/object/entries";
// A nested default that CARRIES the receiver: the outer slot is unknown, so what runs when it is undefined IS the default - and a
// mirror of that default fires under exactly the same condition, which makes it correct on every host, not only in a parameter
// list.
const src = {};
let entries;
({
  b: {
    entries
  } = {
    entries: _Object$entries
  }
} = src);