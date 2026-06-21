// parsers tolerate comments between `?.` and the next token. classifying `?.` (drop both for
// `?.(`/`?.[`, keep `.` for `?.identifier`) must look past the comment to the structural next
// token, not the first non-whitespace char. each line uses a distinct method; the composed
// `?./*c*/at?./*c*/(0)` shape aligns an inner deoptionalize with the outer optional-call guard
const a = arr?./* hint */flat();
const b = obj?./* hint */at?./* call */(0);
const c = list?./* note */includes?./* call */(1);
const d = map?./* k */get('k');
