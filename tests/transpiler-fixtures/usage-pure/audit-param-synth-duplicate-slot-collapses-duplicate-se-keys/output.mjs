import _Array$of from "@core-js/pure/actual/array/of";
// the collapse must not depend on WHICH spelling comes first, and an effect-bearing spelling keeps
// its effect on the pattern either way - the literal only ever carries the resolved name once
let effects = 0;
// TWO effect-bearing spellings of one slot: both prefixes stay on the pattern and run (native runs
// both), while the literal still carries the resolved slot once
const duplicateSeKeys = function ({
  [(effects++, 'of')]: a,
  [(effects++, 'of')]: b
} = {
  "of": _Array$of
}) {
  return [a, b];
}();
export { duplicateSeKeys };
export { effects };