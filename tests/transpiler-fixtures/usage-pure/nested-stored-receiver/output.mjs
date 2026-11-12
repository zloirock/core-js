import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Nested reads keep logical assignment and its selected value, including a prefix.
let a,
  b,
  c = source;
const at = _at((a ||= make()).list);
const includes = _includes((note(), b ??= make()).list);
const flat = _flatMaybeArray((c &&= make()).list);