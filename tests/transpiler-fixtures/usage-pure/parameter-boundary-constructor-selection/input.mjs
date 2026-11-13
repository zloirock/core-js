// A literal wrapper retains the selected constructor and its native slot.
for (const I of [Iterator, Array, null]) {
  (function ({ W: { concat } } = { W: I || Array }) { use(concat); })();
}
