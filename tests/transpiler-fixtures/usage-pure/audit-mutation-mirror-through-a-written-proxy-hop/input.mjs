// the nested-param mirror descends a proxy HOP only while that hop still stands for the pristine
// realm: a slot the user replaced holds the replacement, so the hop's subtree becomes a
// passthrough reading the live value while the untouched sibling keeps its synthesized ponyfill
globalThis.window = fake;
function read({ window: { Array: { from } }, Array: { of } } = globalThis) {
  return [from, of];
}
read();
