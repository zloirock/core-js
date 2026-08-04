// a PARENTHESIZED optional call feeding an instance dispatch: the parens end the chain, so the
// dispatch reads off the guard's value and the receiver has to be memoized around it. native THROWS
// on a nullish there, so the guard stays INSIDE the helper argument and the helper throws on the
// short-circuited void 0 exactly like native - the same rule the destructure-extraction guards
// follow. lifting the test over the helper would be a second spelling of one canon, so both
// emitters keep this one
const arr = [3, [1, 2]];
export const parenOptCallRecv = (arr?.slice()).flat();
// a MEMBER receiver under the same parens needs no memo, so the guard has nowhere to migrate
export const parenOptMemberRecv = (arr?.at(0)).toString();
// the same chain WITHOUT the parens keeps its short-circuit, so the whole dispatch rides one guard -
// the control that pins the parens as the cause rather than the optional call
export const unparenOptCallRecv = arr?.concat([4]).flat();
// the rows that pin the OTHER side of the rule: a LIVE `?.` on the dispatch means native
// short-circuits instead of throwing, and there the test IS hoisted out of the memo - handing
// `void 0` to the helper would throw where the source answers undefined
export const sealedThenOptionalDispatch = (arr?.slice())?.flat();
export const sealedThenOptionalCall = (arr?.slice())?.at?.(0);
export const sealedThenCoalesce = (arr?.slice())?.entries() ?? 'none';
