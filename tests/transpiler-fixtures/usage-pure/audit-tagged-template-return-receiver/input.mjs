// a USER tagged-template return as the receiver: the tag's return type is unknowable, so
// the dispatch must stay GENERIC (a mistyped Maybe would throw when the tag returns the
// other type); the call-rooted receiver memoizes for the `.call` re-read
function tag(strings) { return strings[0]; }
export const r = tag`x`.at(0);
