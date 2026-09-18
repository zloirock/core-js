import _Map from "@core-js/pure/actual/map";
// A loop member target stores its element beyond a local binding, including pattern slots.
// The substituted constructor must carry the statics a later consumer can read.
const box = {};
for ({
  item: box.value
} of [{
  item: _Map
}]) {}
hand(box.value);