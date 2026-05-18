// optional-chain receiver wrapped in transparent wrappers: `(arr?.b).includes(1)`. the
// outer call's receiver is a paren-wrapped MemberExpression whose object is an optional
// chain. `isSafeToReuse` peels ParenthesizedExpression AND ChainExpression to recognize
// the underlying Identifier - skips `_ref` allocation when the inner shape is bare
const arr: any[] = [1, 2];
(arr?.b).includes(1);
