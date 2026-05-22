// let declared inside a catch-clause body. CatchClause.body is a BlockStatement
// whose `.body` is a statement array; the straight-line walker must reach it the
// same way as a free-standing block. at is array+string ambiguous so the narrow
// is driven by flow, not the method itself.
try {
  throw 0;
} catch {
  let x: string | number[] = [];
  x = "hello";
  x.at(0);
}
