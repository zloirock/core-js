// Recovering a destructured alias preserves its writes and redeclarations. A bare var redeclaration adds no value; a loop-head
// write widens the later receiver.
var M;
({ Map: M } = globalThis);
var M = [1, 2];
export const r1c = M?.toReversed();
