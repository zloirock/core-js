// A slot written through a captured alias can select a different receiver in the body.
const inner = { value: [] };
const box = { inner };
for (box.inner.value.at of [0]) {
  inner.value = 'abc';
  consume(box.inner.value.at(-1));
}
