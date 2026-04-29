// combination: for-init with nested proxy-global destructure + SequenceExpression head
// + body reads the destructured binding. for-init can't host a lifted statement outside
// the loop header, so the SE migrates into a sibling SE-sink declarator within the same
// VariableDeclaration; the polyfill is extracted as `from = _polyfill` so it always wins
// regardless of native receiver field
function se() { return globalThis; }
for (const { Array: { from } } = (se(), globalThis); false;) from([]);
