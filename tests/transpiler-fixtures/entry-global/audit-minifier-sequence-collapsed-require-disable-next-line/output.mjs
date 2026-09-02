// an opt-out over a minifier sequence that collapses an entry require covers that entry: the
// split product keeps the operand's own position, so the directive read off the statement as
// written reaches the require's statement and the entry is neither expanded nor removed
const o = {
  x: 1
};
// core-js-disable-next-line
eff();
// core-js-disable-next-line
({
  x
} = o);
// core-js-disable-next-line
require('core-js/actual/array/from');