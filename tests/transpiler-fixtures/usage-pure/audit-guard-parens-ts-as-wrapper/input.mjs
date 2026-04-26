// polyfill guard parenthesised inside a TS `as` wrapper: the rewrite must peel both
// the parens and the cast to recognise the receiver.
const x = (arr?.at(0) as any).foo;
