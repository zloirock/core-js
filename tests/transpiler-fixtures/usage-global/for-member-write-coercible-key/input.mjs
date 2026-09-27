// A const object can select a different property on each key coercion.
const values = [[], [3, 4]];
let index = 0;
const key = { toString() { return String(index); } };
for (values[key].at of [0]) {
  index = 1;
  consume(values[key].at(-1));
}
