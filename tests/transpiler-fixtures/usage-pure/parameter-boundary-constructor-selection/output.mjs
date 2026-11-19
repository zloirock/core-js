import _Iterator from "@core-js/pure/actual/iterator";
// A literal wrapper retains the selected constructor and its native slot.
for (const I of [_Iterator, Array, null]) {
  (function ({
    W: {
      concat
    }
  } = {
    W: I || Array
  }) {
    use(concat);
  })();
}