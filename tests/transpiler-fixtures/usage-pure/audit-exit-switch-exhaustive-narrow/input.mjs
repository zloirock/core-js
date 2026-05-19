// `if (typeof x === 'number') switch(x){case 1: return; default: throw 0;}` - the if's
// consequent is a SwitchStatement where every case function-exits AND there's a default.
// `nodeAlwaysExits(SwitchStatement)` must recognise the exhaustive-exit pattern so the
// post-if scope sees the negated guard `typeof x !== 'number'`. break inside a case would
// exit the switch (not the function), so the FUNCTION_EXIT_STATEMENTS recursion explicitly
// excludes break / continue. without the SwitchStatement branch, the preceding-exit narrow
// drops and `.at()` falls back to generic from string-specific
function probe(x: number | string) {
  if (typeof x === 'number') switch (x) {
    case 1: return null;
    default: throw new Error('unreachable');
  }
  return x.at(0);
}
probe('hello');
