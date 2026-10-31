// A call yields only what a return this build runs hands back: a return in an arm the build never
// takes returns nothing, and one after an `if` whose arm the build always takes and which always
// leaves never runs. An undecided test keeps every return.
function live(source) {
  if (typeof Promise != 'undefined') return 'abc';
  return source;
}
export const fromLive = live(input).at(0);
