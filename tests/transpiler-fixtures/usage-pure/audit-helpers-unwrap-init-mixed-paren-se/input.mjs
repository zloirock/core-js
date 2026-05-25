// init-value peel alternates ParenthesizedExpression peel and SequenceExpression tail
// peel until stable. used to reach the semantic init through any mix of paren wraps and
// SE-prefix layers. distinct methods (.from / .of / .fromAsync) per line surface the
// resolved global per-receiver
const { from } = (((sideEffect(), Array)));
const { of } = ((0, (1, Array)));
const { fromAsync } = (sideEffect(), (0, Array));
export const a = from([1]);
export const b = of(2, 3);
export const c = fromAsync([Promise.resolve(1)]);
