// trailing OPTIONAL member access after chain emit: `arr.flat?.()?.map(x=>x)` - the `?.`
// after the chain emit's end. `guardNeedsParens` already detects `?.X` follow and triggers
// paren-wrap. asserts both eager `.X` (in chainEmitNeedsWrap) and optional `?.X` (in
// guardNeedsParens) paths agree on wrapping the conditional `cond ? a : b` expression
const arr = [1, 2];
arr.flat?.()?.map(x => x);
