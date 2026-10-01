// A loop member target stores its element beyond a local binding, including pattern slots.
// The substituted constructor must carry the statics a later consumer can read.
const box = {};
for (box.value of [Map]) {}
hand(box.value);
