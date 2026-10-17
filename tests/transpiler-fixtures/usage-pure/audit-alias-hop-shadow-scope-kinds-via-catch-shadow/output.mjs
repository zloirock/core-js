import _Array$of from "@core-js/pure/actual/array/of";
// each row: an alias chain whose middle hop is shadowed by a DIFFERENT kind of scope. distinct
// static per row so the usage-global import set attributes every row on its own

// catch param
const catchRoot = Array;
const catchLink = catchRoot;
export function viaCatchShadow() {
  try {
    boom();
  } catch (catchRoot) {
    const of = _Array$of;
    return of(1);
  }
}