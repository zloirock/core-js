// A body-local key names a different receiver from the loop head.
const o = [[], [3, 4]];
const key = 0;
for (o[key].at of functions) {
  const key = 1;
  consume(o[key].at(-1));
}
