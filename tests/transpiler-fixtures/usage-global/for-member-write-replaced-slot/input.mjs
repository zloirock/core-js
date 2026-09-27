// Replacing an intermediate slot breaks the identity with the loop's written receiver.
const box = { values: [] };
for (box.values.at of [0]) {
  box.values = 'abc';
  consume(box.values.at(-1));
}
