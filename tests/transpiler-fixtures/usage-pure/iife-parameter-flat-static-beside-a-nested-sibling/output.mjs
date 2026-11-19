import _Array$of from "@core-js/pure/actual/array/of";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A flat static of an IIFE parameter mirrors the call's argument, as the pattern without its nested
// sibling does: the argument is the receiver every slot reads, so the sibling's slot passes through.
// An expression body has no statement to extract into, a sibling's own default and an array level
// nest the same way, and a selection the build decides mirrors the operand that runs.
(function ({
  trunc,
  deep: {
    a
  }
}) {
  use(trunc, a);
})({
  trunc: _Math$trunc,
  deep: Math.deep
});
(({
  of,
  list: [x]
}) => use(of, x))({
  of: _Array$of,
  list: Array.list
});
(function ({
  fromEntries,
  deep: {
    b
  } = {}
}) {
  use(fromEntries, b);
})({
  fromEntries: _Object$fromEntries,
  deep: Object.deep
});