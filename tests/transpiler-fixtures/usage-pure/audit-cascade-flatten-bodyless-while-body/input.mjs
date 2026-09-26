// `WhileStatement.body` is also a single-statement slot. extends the bodyless wrap
// coverage to loop body shapes - any control statement with a single-stmt body slot
// shares the same `listKey === undefined` path issue.
let from;
while (cond) ({ Array: { from } } = globalThis);
console.log(from);
