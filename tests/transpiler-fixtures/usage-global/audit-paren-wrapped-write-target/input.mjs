// PAREN-WRITE: a write target wrapped in parens, doubled parens or an erased TS operator is still
// a write, so none of these reads as a member read and none injects. the two parsers disagree on
// whether the parens survive into the tree, which is why the climb to the write host goes through
// paren, chain and TS wrappers rather than matching a bare member shape
declare const xs: string[];

(xs.at) = 1;

((xs.at)) = 1;

(xs).at = 1;

(xs.at as any) = 1;

export const a = xs;
