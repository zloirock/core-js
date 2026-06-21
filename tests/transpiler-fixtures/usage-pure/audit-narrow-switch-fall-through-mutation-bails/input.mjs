// switch fall-through guard: `case 'a': x = ...; case 'b': use(x);` - fall-through
// predecessors merge into a typeof-or guard for the body of `case 'b'`. but the
// reassignment in `case 'a'` reaches the use through fall-through; scanning only the
// current SwitchCase's descendants misses the preceding case's mutation, so it must bail
function probe(arg: string | number[]) {
  let x: string | number[] = arg;
  switch (typeof x) {
    case "string":
      x = [1, 2, 3];
    case "object":
      return x.includes(1);
  }
  return false;
}
probe("hi");
