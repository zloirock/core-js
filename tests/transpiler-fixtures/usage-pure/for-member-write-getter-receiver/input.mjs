// A getter can return a fresh receiver even when its body has no effects.
const box = { get values() { return [3, 4]; } };
for (box.values.at of [0]) consume(box.values.at(-1));
