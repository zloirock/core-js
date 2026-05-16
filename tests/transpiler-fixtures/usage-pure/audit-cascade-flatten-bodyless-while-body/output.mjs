import _Array$from from "@core-js/pure/actual/array/from";
// `WhileStatement.body` is also a single-statement slot. extends the bodyless wrap
// coverage to loop body shapes - any control statement with a single-stmt body slot
// shares the same `listKey === undefined` path issue.
let from;
while (cond) {
  from = _Array$from;
}
console.log(from);