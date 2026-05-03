// parsers tolerate block / line comments between `?.` and the next token. classification
// of `?.` (drop both for `?.(`/`?.[`, keep `.` for `?.identifier`) must look past the
// comment to the structural next-token, not at the first non-whitespace char. each line
// uses a distinct method to make per-line dispatch visible: the composed `?./*c*/at?./*c*/(0)`
// shape exercises the path where a polyfilled instance is immediately followed by an
// optional call, so the inner deoptionalize must align with the outer guard transform
const a = arr?./* hint */flat();
const b = obj?./* hint */at?./* call */(0);
const c = list?./* note */includes?./* call */(1);
const d = map?./* k */get('k');
