// let declared inside a try-block. TryStatement.block is a BlockStatement node
// whose `.body` is an array; the straight-line walker must reach it the same
// way as a free-standing block. at is array+string ambiguous so the narrow is
// driven by flow, not the method itself.
try {
  let x: string | number[] = [];
  x = "hi";
  x.at(0);
} catch {}
