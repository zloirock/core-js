// A changed key selects a receiver the loop head did not write.
const o = [[], [3, 4]];
let key = 0;
for (o[key].at of functions) {
  key = 1;
  consume(o[key].at(-1));
}
