// AssignmentPattern wrapper + aliased local name (`from: myFrom`). Wrapper peel must
// preserve the user alias - extracted decl emits `const myFrom = _Array$from` not
// `const from = ...`. Distinct alias per line so per-prop classification is unambiguous
const { Array: { from: myFrom } = {} } = globalThis;
const { Object: { entries: myEntries } = {} } = globalThis;
myFrom('hi');
myEntries({ k: 1 });
