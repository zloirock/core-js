// 3-deep nested destructure assignment через alias-hop (globalThis.self.X.Y). два полифилла
// resolve через self-alias receiver. оба эмитятся independent; пустая destructure удаляется
let from, fromEntries;
({ self: { Array: { from }, Object: { fromEntries } } } = globalThis);
