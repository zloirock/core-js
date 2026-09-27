// An unknown intermediate property can be a getter or a Proxy read.
// Its next value may need a polyfill independently of the written one.
function read(box) {
  for (box.values.at of [0]) return box.values.at(-1);
}
consume(read);
