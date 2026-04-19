// TSSatisfiesExpression wrapper on a computed-key alias (sibling of `as any`)
const arr = [1, 2, 3];
const k = 'at';
arr[(k) satisfies any](0);
