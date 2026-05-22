// let declared inside a switch-case explicit-block. SwitchCase.consequent is a
// statement array that holds a BlockStatement here, so the straight-line walker
// must descend through the case body's nested block the same way as a bare block.
// includes is array+string ambiguous so the narrow is driven by flow, not the
// method itself.
function run(n: number) {
  switch (n) {
    case 0: {
      let x: string | number[] = [];
      x = "hi";
      x.includes("h");
      break;
    }
  }
}
run(0);
