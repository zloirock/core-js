// an outer rewrite renders its spans off PEELED nodes, so a grouping paren the source wrote around
// part of a nested rewrite's range has no place in the outer's content. the nested one still has a
// slot there - the same text without that pair - and it must compose into it
const box = { list: [[1]] };
export const wrapperSpelledRoot = (globalThis.window)?.self.Array.of(2).at(0);

// a statement that STARTS with `(` after a token the parser would fuse it into gets a leading `;`
// when its rewrite is queued. once that rewrite composes into an enclosing one it is no longer at
// statement position, and the separator would sit in the middle of an expression
function getArr() {
  return [[1]];
}
export const composedAtStatementStart = (getArr().flat?.()?.flatMap)(x => x)?.at(0);

// the wrapper around the root of a plain (non-optional) navigation composes the same way
export const wrapperSpelledPlainRoot = (globalThis).Array.of(3, 4).at(-1);
