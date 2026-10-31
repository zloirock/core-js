// A getter ends the receiver chain even inside a nested object carrier.
// Parentheses and a computed read preserve that invocation boundary.
const inner = {
  get value() {
    return [3, 4];
  },
};
const box = { wrap: { inner } };
const key = "value";
(box.wrap.inner[key]).at = 0;
consume(box.wrap.inner.value.at(-1));
