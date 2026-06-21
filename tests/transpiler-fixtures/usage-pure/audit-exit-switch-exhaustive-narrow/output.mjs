import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `if (typeof x === 'number') switch(x){case 1: return; default: throw 0;}` - the if's
// consequent is a SwitchStatement where every case function-exits AND there's a default.
// This exhaustive-exit pattern must be recognised so the post-if scope sees the negated
// guard `typeof x !== 'number'` and `.at()` narrows to string-specific. break inside a
// case exits only the switch, so it must NOT count as a function exit.
function probe(x: number | string) {
  if (typeof x === 'number') switch (x) {
    case 1:
      return null;
    default:
      throw new Error('unreachable');
  }
  return _atMaybeString(x).call(x, 0);
}
probe('hello');