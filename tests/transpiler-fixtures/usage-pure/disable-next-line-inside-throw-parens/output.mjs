import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a directive inside the parens of a `throw` argument: the covered read stays raw, and the print
// keeps the parens - `throw` forbids a line terminator before its operand, so a comment flushed
// after the keyword would otherwise turn the statement into a bare `throw;`. the read beside it
// stays live
export function f() {
  // core-js-disable-next-line
  throw (
    // core-js-disable-next-line
    a.at(0)
  );
}
export const after = _flatMaybeArray(b).call(b);