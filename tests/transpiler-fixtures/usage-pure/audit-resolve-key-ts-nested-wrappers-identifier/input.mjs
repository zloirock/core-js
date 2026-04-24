// nested TS wrappers around a computed-key alias - `unwrapParens` must peel all layers
const arr = [1, 2, 3];
const k = 'at';
arr[((k) as any) as unknown](0);
